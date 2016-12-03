// Libraries
#include <SoftwareSerial.h>
#include <Servo.h>


// Servo pins
#define ESC_PIN 8
#define WHEEL_PIN 9

// Sonic pins
#define L_SONIC 5
#define R_SONIC 4

// Lidar pins
#define LIDAR_MON 7
#define LIDAR_TRIG 6

//LED Control Pins
//#define RIGHT 13
//#define LEFT 10

// Remote
SoftwareSerial XBee(2,3); // RX, TX
int Start = 0;
int Manual = 1;
int Turn = 1;

// Servo global variables
Servo wheels;
Servo esc;

// PID Setpoint (difference in distance between walls)
const int Setpoint = 0;   // maybe make this an int

// PID constants
const double Kp = 1;
const double Ki = 0;
const double Kd = 0;

// Sonic readings
unsigned long Sonic_L, Sonic_R;
int Sonic_L_signed, Sonic_R_signed;
long dist1,dist2;

// Lidar global variables
long lidar, lidar_dist;
int Stop = 0;
int ObjectDetected = 0;

// PID global variables
const double dt = 10; // poll interval in ms
int Input;   // Positive means closer to right (so move left)
int Output; 
int Error;
int PreviousErr;
double Integral;
double Derivative;

// Movement
int Angle;
int Speed;

/************************************Sonic L/R***************************************/

// SONIC
void Poll_Sonic()
{
  Sonic_L = pulseIn(L_SONIC, HIGH);
  Sonic_R = pulseIn(R_SONIC, HIGH);
  dist1 = Sonic_L / 147;
  dist2 = Sonic_R / 147;
  Sonic_L_signed = dist1 * 2.54;
  Sonic_R_signed = dist2 * 2.54;
  Input = Sonic_L_signed - Sonic_R_signed; 
  PrintSonic();
}

void PrintSonic()
{
  Serial.print("Left: ");
  Serial.print(Sonic_L_signed);
  Serial.print("lidar_dist");
  Serial.print("Right: ");
  Serial.print(Sonic_R_signed);
  Serial.println("lidar_dist");
  Serial.print("Input (L - R): ");
  Serial.println(Input);
}

/**********************************Lidar Detect Obstacle*********************************/

void Poll_Lidar() {
  lidar = pulseIn(LIDAR_MON, HIGH) / 10; // 10usec = 1 lidar_dist of distance for LIDAR-Lite
  lidar_dist = double(lidar);
/*  Serial.print("Front: ");
  Serial.print(lidar_dist);
  Serial.println("lidar_dist");*/
  
  if (lidar_dist < 44)               // CHANGE THIS BACK AFTER TESTING
    ObjectDetected = 1;
  else
    ObjectDetected = 0;
}

/***********************************PID Control***************************************/

void PID_Control() {
  delay(dt);

  Error = Setpoint - Input;

  Integral = Integral + (Error * dt);
  Derivative = (Error - PreviousErr) / dt;
  
  Output = (Kp * Error) + (Ki * Integral) + (Kd * Derivative);

  PreviousErr = Error;

 /* Serial.print("Error: ");
  Serial.println(Error);
  Serial.print("              Output: ");
  Serial.println(Output);*/

  if (!ObjectDetected)
    MoveCar();
  else {
    Serial.println("            OBJECT DETECTED!");
  //  Serial.println("Back Up!");
    
    Speed = 90;
    esc.write(Speed);
    delay(3000);

  //  Serial.print("Speed: ");
  //  Serial.println(Speed);
  //  Serial.println();
  }
}


/***************************************Move Car*****************************************/

void MoveCar() {
  int turnNumber;
  int Angle;
  int Speed;
  int Offset;
  int turnMultiplier = 7;

  // Bad Lidar reading (really when == 0)
  if ((Sonic_L_signed < 15) || (Sonic_R_signed < 15)) {
   // Serial.println("   CASE 1");
    // slow down while lidar reading bad value
    Speed = 78;
    esc.write(Speed); // go slow when no walls on either side (for now at least) 
    
    // bad left reading
    if (Sonic_L_signed < 15) {
      // try to stay ~2ft from only (right) wall
      if (Sonic_R_signed > 40) // move closer to only (right) wall
        wheels.write(55);
      else if (Sonic_R_signed < 30) // move further from only (right) wall
        wheels.write(105);
      else 
        wheels.write(90);
   //   Serial.println("Bad lidar reading. Trying to follow RIGHT wall.");     
   //   Serial.print("Speed: ");
   //   Serial.println(Speed);
    }
    // bad right reading
    else if (Sonic_R_signed < 15) {
      // try to stay ~2ft from only (left) wall
      if (Sonic_L_signed > 40) // move closer to only (left) wall
        wheels.write(125);
      else if (Sonic_L_signed < 30) // move further from only (left) wall
        wheels.write(75);
      else 
        wheels.write(90);
   /*   Serial.println("Bad lidar reading. Trying to follow LEFT wall.");     
      Serial.print("Speed: ");
      Serial.println(Speed);*/
    }  
  }
     
  // WALLS ON BOTH SIDES  (walls or objects on both sides)
  else if ((abs(Input) < 150) && ((Sonic_L_signed < 150) && (Sonic_R_signed < 150))) {  
  //  Serial.println("   CASE 2");
      // Turn amount 5:max , 0:none
      if (abs(Input) > 100) 
        turnNumber = 5;
      else if (abs(Input) > 70)
        turnNumber = 4;
      else if (abs(Input) > 50)
        turnNumber = 3;
      else if (abs(Input) > 30)
        turnNumber = 2;
      else if (abs(Input) > 15)
        turnNumber = 1;
      else 
        turnNumber = 0;     
        
      // Make a turn
      if (turnNumber > 0) {
          // Move Left
          if (Output < 0) { // Left turn is increasing angle
              Angle = 90 + turnMultiplier*turnNumber;
              wheels.write(Angle);
    //          Serial.print("Wheels: << Left turn <<");  
          }
          // Move Right
          else if (Output > 0) { // Right turn is decreasing angle
              Angle = 90 - turnMultiplier*turnNumber; // lowered this
              wheels.write(Angle);
       //       Serial.print("Wheels: >> Right turn >>");
          }
          else { // Output == 0 and Input > 10 (should never happen)
            Serial.print("Wheels: Fuckin up..shouldn't be here...");
          }
     /*     Serial.print("   turnNumber: ");
          Serial.print(turnNumber);
          Serial.print("    Angle: ");
          Serial.println(Angle);*/
      }
      else { // turnNumber == 0 (no turn)
        wheels.write(90);
 //       Serial.println("Wheels: Straight   turnNumber: 0"); 
      }
      // Bigger turn -> slower speed
      Speed = 67 + turnNumber; 
      esc.write(Speed);
  //    Serial.print("Speed: ");
  //    Serial.println(Speed);
  }


  // OPENING ON ONE OR BOTH SIDES
  else {
    //  Serial.println("   CASE 3");
 
      // slow down while one or more walls is missing
      Speed = 77;
      esc.write(Speed); // go slow when no walls on either side (for now at least)  
      // no walls
      if ((Sonic_L_signed > 155) && (Sonic_R_signed > 155)) {
//          if (Input == 0) // straight
//            Offset = 0;
//          else if (Input < 0) // closer to left, drift right slightly
//            Offset = -5;
//          else if (Input > 0) // closer to right, drift left slightly
//            Offset = 5;
          Offset = 60;
          Angle = 90 + Offset;
          wheels.write(Angle);
    /*      Serial.println("NO WALLS! Slowing down.");
          Serial.print("Speed: ");
          Serial.println(Speed);*/
      }
      // no left wall
      else if (Sonic_L_signed > Sonic_R_signed) {
        // try to stay ~2ft from only (right) wall
        if (Sonic_R_signed > 95) // move closer to only (right) wall
          wheels.write(80);
        else if (Sonic_R_signed < 70) // move further from only (right) wall
          wheels.write(140);
        else 
          wheels.write(90);
    /*    Serial.println("No LEFT wall! slowing down.");     
        Serial.print("Speed: ");
        Serial.println(Speed);*/
      }
      // no right wall
      else if (Sonic_R_signed > Sonic_L_signed && Sonic_R_signed >150 && Turn == 1) {
        // try to stay ~2ft from only (left) wall
//        if (Sonic_L_signed > 95) // move closer to only (left) wall
//          wheels.write(100);
//        else if (Sonic_L_signed < 70) // move further from only (left) wall
//          wheels.write(40);
//        else 
//          wheels.write(90);
   /*     Serial.println("No RIGHT wall! slowing down.");     
        Serial.print("Speed: ");
        Serial.println(Speed);*/
       esc.write(80);
       wheels.write(50);
       delay(3000);
       Turn = 1;
      } 
    }
 
 // Serial.println();
}

/***************************************ON/OFF Control***************************************/
/*void checkMode() {
  //Serial.println("Check Mode.");
  char r;
  String data;
  if (XBee.available()) {
  do {
    r = XBee.read();
    Serial.println(r);
    data += r;   
  } 
  while (r != -1);
  data = data.substring(0,data.length() - 1);
  }
  
  // Check data for server mode changing signal
  for (int i=0;i<data.length();i++) {
    // auto drive command received
    if (data[i] == 'a') {
      Serial.println("Remote AUTO DRIVE received. Calibrating ESC.");
    //  Start = 1;
      Manual = 0;
    }
    //manual drive command received
    else if (data[i] == 'm') {
      Serial.println();
      Serial.println("Remote MANUAL DRIVE received. Exiting Loop.");
      Serial.println();
     // Start = 0;
      Manual = 1;
      delay(250);
    //  setup();
    }
  }
}
*/
void checkCommand() {
  //Serial.println("Check Command from remote control.");
  char r,r1;
  String data;
  if (XBee.available()) {
  //do {
    r1 = XBee.read();
    r= r1;
   //data += r; 
   // Serial.println(r); 
 // } 
 // while (r != -1);
 // data = data.substring(0,data.length() - 1);
  }
  
  // Check data for server shutdown signal while awaiting handshake
//  for (int i=0;i<data.length();i++) {
    if (r == 'a') {
      Serial.println("Remote AUTO DRIVE received. Calibrating ESC.");
    //  Start = 1;
      Manual = 0;
    }
    //manual drive command received
    else if (r == 'm') {
      Serial.println();
      Serial.println("Remote MANUAL DRIVE received. Exiting Loop.");
      Serial.println();
     // Start = 0;
      Manual = 1;
      delay(250);
    //  setup();
    }
    // FORWARD command received
    if(Manual == 1)
    {
       if (r == '1') {
      Serial.println("Remote FORWARD received. Calibrating ESC.");
     // Start = 1;
      esc.write(60);
      wheels.write(90);
       }
    // FORWARD command received
      else if (r == '0') {
      Serial.println();
      Serial.println("Remote OFF received. Exiting Loop.");
      Serial.println();
    //  Start = 0;
      wheels.write(90);
     // delay(250);
      setup();
      }
    else if(r== '2') {
      Serial.println();
      Serial.println("Remote LEFT TURN received.");
      Serial.println();
     // delay(250);
      wheels.write(130);
    }
    else if(r == '3') {
      Serial.println();
      Serial.println("Remote RIGHT TURN received.");
      Serial.println();
     // delay(250);
      wheels.write(50);
    }
    else if(r == '4') {
      Serial.println();
      Serial.println("Remote BACK received.");
      Serial.println();
      esc.write(130);
      wheels.write(90);
    }
    }
    else if(Manual == 0)
    {
      if (r == '1') {
      Serial.println("Remote FORWARD auto received. Calibrating ESC.");
      Start = 1;
      esc.write(75);
      wheels.write(90);
    }
    // FORWARD command received
    else if (r == '0') {
      Serial.println();
      Serial.println("Remote OFF auto received. Exiting Loop.");
      Serial.println();
      Start = 0;
      wheels.write(90);
      //delay(250);
      setup();
    }
    else if (r == 'n') {
      Serial.println();
      Turn = 0;
      Serial.println("Not Turn");
      Serial.println();
//      esc.write(80);
//      wheels.write(40);
     // delay(250);
    }
    }
  //}
}

/*void checkOn() {
  char r;
  String data;
  if (XBee.available()) {
  do {
    r = XBee.read();
    data += r;   
  } 
  while (r != -1);
  data = data.substring(0,data.length() - 1);
  }
  
  // Check data for server shutdown signal while awaiting handshake
  for (int i=0;i<data.length();i++) {
    // Quit command received
    if (data[i] == '1') {
      Serial.println("Remote ON received. Calibrating ESC.");
      Start = 1;
      wheels.write(90);
    }
  }
}*/

  
/***************************************Set Up********************************************/

void setup() {

  // Serial monitor
  Serial.begin(9600);
  // Xbee start
  XBee.begin(9600);
  
  // Servo attach
  esc.attach(ESC_PIN);
  wheels.attach(WHEEL_PIN);

  // Remote start
  for (int i = 0; i < 100; i++)
  Serial.println();
  Serial.println("Arduino on. Waiting for remote start.\n");
  
  // Servo calibration
  esc.write(90); // neutral
  wheels.write(90);
  Serial.println("Car stops at first");
  //while (Start)
  //  checkOn();

  delay(1000);

  //SONIC
  pinMode(L_SONIC, INPUT);
  pinMode(R_SONIC, INPUT);
    
  // Servo calibration
  delay(500);

  // LIDAR
  pinMode(LIDAR_TRIG, OUTPUT);
  pinMode(LIDAR_MON, INPUT);
  digitalWrite(LIDAR_TRIG, LOW); // Set trigger LOW for continuous read

  // initialize PID variables
  PreviousErr = Setpoint - Input;
  Integral = 0;

  // Check distances
  Serial.print("Initial Position:   "); 
  //Poll_Sonic();
  Serial.println("Starting...");
  Serial.println("\n");
  delay(500);
}

/*****************************************Loop**********************************************/
void loop() {
  //checkMode();
 // esc.write(78);
  // Remote
  checkCommand();
 // Serial.println(Manual);
  
  if(Manual == 1) 
  { 
  }
  else {
  // Stopping
    Poll_Lidar();
    //Poll_Remote();
  
    // Steering
    Poll_Sonic();
    PID_Control();
  }
}

