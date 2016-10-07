#include <SoftwareSerial.h>
SoftwareSerial XBee(2, 3); // RX, TX
String str;
int led1, led2, led3, led4;

void setup()
{
  // Set up both ports at 9600 baud. This value is most important
  // for the XBee. Make sure the baud rate matches the config
  // setting of your XBee.
  XBee.begin(9600);
  Serial.begin(9600);
  
  pinMode(4, OUTPUT);
  pinMode(5, OUTPUT);
  pinMode(6, OUTPUT);
  pinMode(7, OUTPUT);

  //read initial status of LEDs and send them to server
  led1 = digitalRead(4);   //Read the status of LED1, on pin 4: 1: on; 0: off
  led2 = digitalRead(5);   //Read the status of LED2, on pin 5
  led3 = digitalRead(6);   //Read the status of LED3, on pin 6
  led4 = digitalRead(7);   //Read the status of LED4, on pin 7
  //Serial.write(led1);

  if (digitalRead(4) == HIGH)  
    led1 = 1;
  else
    led1 = 0;

  if (digitalRead(5) == HIGH)  
    led2 = 1;
  else
    led2 = 0;

  if (digitalRead(6) == HIGH)  
    led3 = 1;
  else
    led3 = 0;

  if (digitalRead(7) == HIGH)  
    led4 = 1;
  else
    led4 = 0;

  char buf[4];
  sprintf(buf, "%d%d%d%d\n", led1, led2, led3, led4); // puts string into buffer
  Serial.write (buf);
  
  XBee.write(buf);  
  delay(2000);
}

void loop()
{
  if (Serial.available())
  { // If data comes in from serial monitor, send it out to XBee
    XBee.write(Serial.read());
  }
  if (XBee.available())
  { // If data comes in from XBee, send it out to serial monitor
    int tmp = 0;
    tmp = XBee.read();
    //Serial.write(tmp);
    led1 = tmp;
    led2 = tmp;
    led3 = tmp;
    led4 = tmp;
    Serial.print(led1);
    if (led1 == 49){
      digitalWrite(4, HIGH);
    }
    else if(led1 == 48){
      digitalWrite(4, LOW);
    }
    if (led2 == 49){
      digitalWrite(5, HIGH);
    }
    else if(led2 == 48){
      digitalWrite(5, LOW);
    }

    if (led3 == 49){
      digitalWrite(6, HIGH);
    }
    else if(led3 == 48){
      digitalWrite(6, LOW);
    }

    if (led4 == 49){
      digitalWrite(7, HIGH);
    }
    else if(led4 == 48){
      digitalWrite(7, LOW);
    }
    
  }
}
