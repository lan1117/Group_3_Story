#include <XBee.h>
#include <SoftwareSerial.h>

#define LED_BLUE              6    // leader
#define LED_RED               4    // infect
#define LED_GREEN             5    // clear
#define BUTTON                8    // infection/clear toggle

XBee xbee = XBee();
//Define SoftSerial TX/RX pins
//pin2 -> TX of xbee-serial device
//pin3 -> RX of xbee-serial device
SoftwareSerial xbeeSerial(2, 3);
ZBRxResponse rxResponse = ZBRxResponse();
ZBTxRequest txRequest;
AtCommandRequest atRequest = AtCommandRequest((uint8_t*)slCommand);
AtCommandResponse atResponse;

const uint8_t ELECTIONMESSAGE = 0xB0, ACKNOWLEDGE = 0xB1, VICTORYMESSAGE = 0xB2, INFECTIONMESSAGE = 0xB3, CLEARMESSAGE = 0xB4, DISCOVERYMESSAGE = 0xB5, LEADERRESPONSE = 0xB6;

//serial low
const uint8_t slCommand[] = {'S', 'L'};
const uint8_t add = 0x0000FFFF, addhigh = 0x0013A200;
uint8_t DeviceID, leaderID, newDevice; 
uint8_t listID[10];
uint8_t device = 0;
bool Infected = false;
bool Electing = false;
bool Acknowledged = false;
uint32_t electionTimeout, leaderResponseTimeout, immunityTimeout, infectionRebroadcastTimeout;
int buttonState, lastButtonState = LOW;
int lastDebounceTime = 0;
int debounceDelay = 50;
int DeviceID=1;

void setup() {
  Serial.begin(9600);
  xbeeSerial.begin(9600);
  xbee.begin(xbeeSerial);
  delay(2000);
  initLedPins();
  leaderID = DeviceID;
  sendCommand(add, (uint8_t*)&DISCOVERYMESSAGE, 1);
  //6000: period for hearing leader's response
  leaderResponseTimeout = millis() + 6000;
}

void loop() {
  // read the state of the switch into a local variable
  int reading = digitalRead(BUTTON);

  // check to see if you just pressed the button
  // (i.e. the input went from LOW to HIGH),  and you've waited
  // long enough since the last press to ignore any noise

  // If the switch changed, due to noise or pressing
  if (reading != lastButtonState) {
    // reset the debouncing timer
    lastDebounceTime = millis();
  }
  if (millis() - lastDebounceTime > debounceDelay) {
    // whatever the reading is at, it's been there for longer
    // than the debounce delay, so take it as the actual current state

    // if the button state has changed
    if (reading != buttonState) {
      buttonState = reading;
      // only toggle the Button operation if the new button state is HIGH
      if (buttonState == HIGH) {
        //if I am the leader, send clear msg to non-leaders
        if (leaderID == DeviceID) {
          sendCommand(add, (uint8_t*)&CLEARMESSAGE, 1);
          Infected = false;
        }
        //if I am a non-leader, I got infected
        else Infected = true;
      }
    }
  }

  // save the reading.  Next time through the loop,
  // it'll be the lastButtonState
  lastButtonState = reading;

  //set three LEDs according to flag isInfected
  setLedStates();
  //handle packet msgs
  PacketsRead();

  //if an election is over
  if (Electing && millis() > electionTimeout) {
    Electing = false;
    //6000: period for hearing leader's response
    leaderResponseTimeout = millis() + 6000;
    //5000: period for complete a election
    electionTimeout = millis() + 5000;
    if (Acknowledged) beginElection();
    else {
      sendCommand(add, (uint8_t*)&VICTORYMESSAGE, 1);
      leaderID = DeviceID;
    }
  }
  if (!Electing) {
    if (millis() > leaderResponseTimeout) {
      if (leaderID == DeviceID) {
        sendCommand(add, (uint8_t*) &LEADERRESPONSE, 1);
        leaderResponseTimeout = millis() + 6000 / 3;
      } else {
        Serial.println("Leader dead.");
        beginElection();
      }
    }
    if (leaderID != DeviceID && Infected && millis() > infectionRebroadcastTimeout) {
      sendCommand(add, (uint8_t*) &INFECTIONMESSAGE, 1);
      //4000: period for sending infection message to all non-leaders 
      infectionRebroadcastTimeout = millis() + 4000;
    }
  }
}

void initLedPins(void) {
  pinMode(LED_BLUE, OUTPUT);
  pinMode(LED_RED, OUTPUT);
  pinMode(LED_GREEN, OUTPUT);
  digitalWrite(LED_BLUE, HIGH);
  digitalWrite(LED_RED, HIGH);
  digitalWrite(LED_GREEN, HIGH);
}

void setLedStates(void) {
  //if I am the leader, just keep blue LED up
  //if I am the non-leader, check I have to light green or red
  if (DeviceID == leaderID) {
    digitalWrite(LED_BLUE, HIGH);
    digitalWrite(LED_GREEN, LOW);
    digitalWrite(LED_RED, LOW);
  } else {
    digitalWrite(LED_BLUE, LOW);
    if (Infected) {
      digitalWrite(LED_GREEN, LOW);
      digitalWrite(LED_RED, HIGH);
    } else {
      digitalWrite(LED_GREEN, HIGH);
      digitalWrite(LED_RED, LOW);
    }
  }
}

void sendCommand(uint32_t destinationID, uint8_t* payload, uint8_t length) {
  if (payload[0] == DISCOVERYMESSAGE || payload[0] == VICTORYMESSAGE) {
    txRequest = ZBTxRequest(XBeeAddress(0x00000000, add), payload, length);
    xbee.send(txRequest);
  } else {
    if (destinationID == add) {
      for (int i = 0; i < device; i++) {
        txRequest = ZBTxRequest(XBeeAddress(addhigh, listID[i]), payload, length);
        xbee.send(txRequest);
      }
    } else {
      txRequest = ZBTxRequest(XBeeAddress(addhigh, destinationID), payload, length);
      xbee.send(txRequest);
    }
  }
}

void beginElection(void) {
  if (Electing)  return;
  if (millis() < electionTimeout) return;
  else Electing = true;
  Acknowledged = false;
  uint8_t countDevices = 0;
  for (int i = 0; i < device; i++) {
    if (listID[i] > DeviceID) {
      sendCommand(listID[i], (uint8_t*) &ELECTIONMESSAGE, 1);
      countDevices++;
    }
  }
  //1000: period for hearing replys from other devices
  if (countDevices > 0) electionTimeout = millis() + 1000;
  else electionTimeout = millis();
}

void PacketsRead(void) {
  //  get a response && this response is current type
  if (xbee.readPacket(1) && xbee.getResponse().getApiId() == ZB_RX_RESPONSE) {
    xbee.getResponse().getZBRxResponse(rxResponse);
    newDevice = rxResponse.getnewDevice().getLsb();
    bool inList = false;
    for (int i = 0; i < device; i++)
      if (listID[i] == newDevice)
        inList = true;
    if (!inList) listID[device++] = newDevice;
    
    switch (rxResponse.getData(0)) {
      case DISCOVERYMESSAGE:
        if (rxResponse.getDataLength() > 1) {
          memcpy(&leaderID, rxResponse.getData() + 1, sizeof(leaderID));
          if (leaderID < DeviceID) beginElection();
        } else {
          uint8_t msgPayload[5];
          msgPayload[0] = DISCOVERYMESSAGE;
          memcpy(msgPayload + 4, &leaderID, sizeof(leaderID));
          sendCommand(newDevice, msgPayload, 5);
        }
        break;

      case ELECTIONMESSAGE:
        sendCommand(newDevice, (uint8_t*)&ACKNOWLEDGE, 1);
        beginElection();
        break;

      case ACKNOWLEDGE:
        //3000: period for a victory being elected
        electionTimeout = millis() + 3000 ;
        Acknowledged = true;
        break;

      case VICTORYMESSAGE:
        if (newDevice > DeviceID) {
          leaderID = newDevice;
          Electing = false;
          leaderResponseTimeout = millis() + 6000;
          //5000: period for complete a election
          electionTimeout = millis() + 5000;
        }
        else beginElection();
        break;

      case LEADERRESPONSE:
        if (DeviceID == leaderID) {
          if (newDevice > DeviceID){
            leaderID = newDevice;
            leaderResponseTimeout = millis() + 6000;
          }
        } else leaderResponseTimeout = millis() + 6000;
        break;

      case INFECTIONMESSAGE:
        if (millis() > immunityTimeout && leaderID != DeviceID)
          Infected = true;
        break;

      case CLEARMESSAGE:
        Infected = false;
        //3000: period for a non-leader being infected from normal state
        immunityTimeout = millis() + 3000;
        break;
    }
  }
}

