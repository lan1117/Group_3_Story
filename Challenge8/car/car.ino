// Libraries
#include <SoftwareSerial.h>
#include <Servo.h>
#include <PID_v1.h>

// Servo pins
#define ESC_PIN 13
#define WHEEL_PIN 9

// Sonic pins
#define L_SONIC 5
#define R_SONIC 4

// Lidar pins
#define LIDAR_MON 7
#define LIDAR_TRIG 6

// Remote
SoftwareSerial XBee(2,3); // RX, TX
int Start = 0;
int Manual = 0;
int Turn = 1;

// Servo global variables
Servo wheels;
Servo esc;

double Setpoint = 0, Input, Output;
double aggKp = 10, aggKi = 0.005, aggKd = 3;
double consKp = 1, consKi = 0, consKd = 0.25;

PID myPID(&Input, &Output, &Setpoint, consKp, consKi, consKd, DIRECT);

// Sonic readings
unsigned long Sonic_L, Sonic_R;
int Sonic_L_signed, Sonic_R_signed;
long dist1,dist2;

// Lidar global variables
long lidar, lidar_dist;

// Global flags
int ObjectDetected = 0;
int State = 0;

/************************************Sonic L/R***************************************/

// SONIC
void GetSonic()
{
  Sonic_L = pulseIn(L_SONIC, HIGH);
  Sonic_R = pulseIn(R_SONIC, HIGH);
  dist1 = Sonic_L / 147;
  dist2 = Sonic_R / 147;
  Sonic_L_signed = dist1 * 2.54;
  Sonic_R_signed = dist2 * 2.54;
  Input = (Sonic_L_signed - Sonic_R_signed)/2; 
  PrintSonic();
}

void PrintSonic()
{
  Serial.print("Left: ");
  Serial.println(Sonic_L_signed);
  Serial.print("                      Right: ");
  Serial.println(Sonic_R_signed);
  Serial.print("                                          Input (L - R): ");
  Serial.println(Input);
}

/**********************************Lidar Detect Obstacle*********************************/

void GetLidar() {
  lidar = pulseIn(LIDAR_MON, HIGH) / 10; // 10usec = 1 lidar_dist of distance for LIDAR-Lite
  lidar_dist = double(lidar);
  
  if (lidar_dist < 70)               // CHANGE THIS BACK AFTER TESTING
    ObjectDetected = 1;
  else
    ObjectDetected = 0;
}

/***********************************Obstacle Detect***************************************/

void ObstacleDetect() {
  /*delay(dt);

  Error = Setpoint - Input;

  Integral = Integral + (Error * dt);
  Derivative = (Error - PreviousErr) / dt;
  
  Output = (Kp * Error) + (Ki * Integral) + (Kd * Derivative);

  PreviousErr = Error;*/

 /* Serial.print("Error: ");
  Serial.println(Error);
  Serial.print("              Output: ");
  Serial.println(Output);*/

  if (!ObjectDetected)
    MoveCar();
  else {
    Serial.println("            OBJECT DETECTED!");
    esc.write(90);
    delay(500);
    esc.write(110);
    wheels.write(90);
    delay(1000);
  }
}

/***************************************Move Car*****************************************/

void MoveCar() {
  //IF WALLS ON BOTH SIDES, DO PID CONTROL
  //if ((abs(Input) < 160) && ((Sonic_L_signed < 160) && (Sonic_R_signed < 160))) {
    esc.write(65);
    Serial.println("WALL ON BOTH SIDES");
    myPID.SetTunings(aggKp, aggKi, aggKd);
    myPID.Compute();
    Serial.println("output");
    Serial.println(Output);
    wheels.write(90-Output);
  //}
  //IF NO WALL ON ANY SIDE
  if ((Sonic_L_signed > 255) && (Sonic_R_signed > 255)) {
    Serial.println("NO WALLS");
    esc.write(115);
    wheels.write(90);
    delay(1000);
    esc.write(65);
    wheels.write(40);
    delay(1000);
  }
  //IF NO LEFT WALL ONLY
  else if ((Sonic_L_signed > Sonic_R_signed) && Sonic_L_signed > 255 && Sonic_R_signed < 160) {
    Serial.println("NO LEFT WALL");
    if (Sonic_R_signed > 95) // move closer to only (right) wall
      wheels.write(80);
    else if (Sonic_R_signed < 70) // move further from only (right) wall
      wheels.write(140);
    else 
      wheels.write(90);
  }
  //IF NO RIGHT WALL ONLY
  else if ((Sonic_R_signed > Sonic_L_signed) && Sonic_R_signed >250 && Sonic_L_signed < 160) {
    Serial.println("NO RIGHT WALL");
    //FIRST CORNER
    if(Turn == 1) {
      esc.write(115);
      wheels.write(90);
      delay(1000);
      esc.write(65);
      wheels.write(40);
      delay(1000);
    }
    //ELEVATOR
    else {
      Serial.println("                    ELEVATOR!!");
      esc.write(30);
      if (Sonic_L_signed > 95) // move closer to left wall
        wheels.write(100);
      else if (Sonic_L_signed < 70) // move further from left wall
        wheels.write(80);
      else 
        wheels.write(90);
      Turn = 1;
    }
  } 
}

/***************************************Remote Control***************************************/

void checkCommand() {
  //Serial.println("Check Command from remote control.");
  char r,r1;
  String data;
  if (XBee.available()) {
    r1 = XBee.read();
    r= r1;
  }  

  if(Manual == 1){
    switch(r){
      case '1': {
        Serial.println("Remote FORWARD received. Calibrating ESC.");
        esc.write(60);
        wheels.write(90);
        break;
      }
      case '0': {
        Serial.println();
        Serial.println("Remote OFF received. Exiting Loop.");
        Serial.println();
        wheels.write(90);
        setup();
        break;
      }
      case '2': {
        Serial.println();
        Serial.println("Remote LEFT TURN received.");
        Serial.println();
        wheels.write(120);
        break;
      }
      case '3': {
        Serial.println();
        Serial.println("Remote RIGHT TURN received.");
        Serial.println();
        wheels.write(60);
        break;
      }
      case '4': {
        Serial.println();
        Serial.println("Remote BACK received.");
        Serial.println();
        esc.write(110);
        wheels.write(90);
        break;
      }
      case 'a': {
        Serial.println("Remote AUTO DRIVE received. Calibrating ESC.");
        Manual = 0;
        break;
      }
      //manual drive command received
      case 'm': {
        Serial.println();
        Serial.println("Remote MANUAL DRIVE received. Exiting Loop.");
        Serial.println();
        Manual = 1;
        break;
      }
    }
  }
  else if(Manual == 0) {
    switch(r){
      case '1': {
        Serial.println("Remote FORWARD auto received. Calibrating ESC.");
        Start = 1;
        esc.write(65);
        wheels.write(90);
        break;
      }
    // FORWARD command received
      case '0': {
        Serial.println();
        Serial.println("Remote OFF auto received. Exiting Loop.");
        Serial.println();
        Start = 0;
        wheels.write(90);
        setup();
        break;
      }
      case 'n': {
        Serial.println();
        Turn = 0;
        Serial.println("Not Turn");
        Serial.println();
       break;
      }
      case 'a': {
        Serial.println("Remote AUTO DRIVE received. Calibrating ESC.");
        Manual = 0;
        break;
      }
      //manual drive command received
      case 'm': 
      {
        Serial.println();
        Serial.println("Remote MANUAL DRIVE received. Exiting Loop.");
        Serial.println();
        Manual = 1;
        break;
      }
    }
  }
}
  
/***************************************Set Up********************************************/

void setup() {

  // Serial monitor
  Serial.begin(9600);
  // Xbee start
  XBee.begin(9600);
  
  // Servo attach
  esc.attach(ESC_PIN);
  wheels.attach(WHEEL_PIN);

  Setpoint = 0;
  myPID.SetMode(AUTOMATIC);
  myPID.SetOutputLimits(-25, 25);
  // Remote start
  for (int i = 0; i < 100; i++)
  Serial.println();
  Serial.println("Arduino on. Waiting for remote start.\n");
  
  // Servo calibration
  esc.write(90); // neutral
  wheels.write(90);
  Serial.println("Car stops at first");

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

  // Check distances
  Serial.print("Initial Position:   "); 
  //GetSonic();
  Serial.println("Starting...");
  Serial.println("\n");
  delay(500);
}

/*****************************************Loop**********************************************/
void loop() {
  // Remote
  checkCommand();
  
  if(Manual == 0) {
    GetLidar();
    GetSonic();
    ObstacleDetect();
  }
}

