#include "pid/pid.h"
#include <math.h>

Servo wheels; // servo for turning the wheels
Servo esc; // not actually a servo, but controlled like one!
bool startup = true; // used to ensure startup only happens once
int startupDelay = 1000; // time to pause at each calibration step
double maxSpeedOffset = 45; // maximum speed magnitude, in servo 'degrees'
double maxWheelOffset = 85; // maximum wheel turn magnitude, in servo 'degrees'
time_t t = 0;
double B=0;
unsigned long front;
unsigned long back;
int aaa=D7;

//Define Variables we'll be connecting to
double Setpoint, Input, Output;
double Kp = 2;
double Ki = 0.05;
double Kd = 0.5;
double dist=150;
int which_command = 0;

//Specify the links and initial tuning parameters
PID myPID(&Input, &Output, &Setpoint,Kp,Ki,Kd, PID::DIRECT);

void setup()
{
  wheels.attach(D0); // initialize wheel servo to Digital IO Pin #8
  esc.attach(D1); // initialize ESC to Digital IO Pin #9
  //calibrateESC();
  pinMode(A0, INPUT);
  //Serial.begin(9600); // Start serial communications
  pinMode(D2, OUTPUT); // Set pin 2 as trigger pin of left lidar
  pinMode(D3, INPUT); // Set pin 3 as monitor pin
  digitalWrite(D2, LOW); // Set trigger LOW for continuous read
  pinMode(D4, OUTPUT); // Set pin 4 as trigger pin of right lidar
  pinMode(D5, INPUT);
  pinMode(aaa, OUTPUT);// Set pin 5 as monitor pin
  digitalWrite(D4, LOW);
  Particle.function("fun_test", lightLED);
  //Particle.function("fun_test1", speed);
  
  Particle.function("setSpeed", setSpeed);
  
  double B=analogRead(A0)*3.3/4095;
     t = millis();
     Particle.publish("time1",String(t),PRIVATE);
  //initialize the variables we're linked to
  //Input = analogRead(3);
  esc.write(70);
  wheels.write(90);
  Setpoint = 50;
  myPID.SetOutputLimits(-40, 40);
  //turn the PID on
  myPID.SetMode(PID::AUTOMATIC);
}

/* Convert degree value to radians */
double degToRad(double degrees){
  return (degrees * 71) / 4068;
}

/* Convert radian value to degrees */
double radToDeg(double radians){
  return (radians * 4068) / 71;
}

int setSpeed(String cmd) {
    if(cmd == "90") {
        which_command = 2;
    }
    else if(cmd == "60") {
        which_command = 1;
    }
    else if(cmd == "30") {
        which_command = 3;
    }
    return which_command;
}

/*void calibrateESC(){
    esc.write(180); // full backwards
    delay(startupDelay);
    esc.write(0); // full forwards
    delay(startupDelay);
    esc.write(90); // neutral
    delay(startupDelay);
    esc.write(90); // reset the ESC to neutral (non-moving) value
}*/

//sonic
double getDistance(){
  //8cm - 20cm
  int x1 = analogRead(1);
  double Raw1 = (3.3/4095)*x1;
  double x2 = 3.3/512;
  double x3 = (Raw1/x2)*2.54;
  return x3;
}

void loop()
{
     dist = getDistance();
  Particle.publish("sonic", String(dist), PRIVATE);
  if(dist < 100){
     /* esc.write(75);
      delay(500);
      esc.write(80);
      delay(500);
      esc.write(85);
      delay(500);*/
      esc.write(90);
  }
  else{
      esc.write(70);
  }
    switch (which_command) {
        case 1:
            esc.write(70);
         //   digitalWrite(aaa,HIGH);
            which_command = 0;
            break;
        case 2:
            esc.write(90);
          //  digitalWrite(aaa,LOW);
            which_command = 0;
            break;
       /* case 85:
            esc.write(5);
            which_command = 0;
            break;
        case 75:
            esc.write(15);
            which_command = 0;
            break;
        case 65:
            esc.write(25);
            which_command = 0;
            break;
        case 55:
            esc.write(35);
            which_command = 0;
            break;
        case 45:
            esc.write(45);
            which_command = 0;
            break;
        case 35:
            esc.write(55);
            which_command = 0;
            break;
        case 25:
            esc.write(65);
            which_command = 0;
            break;
        case 15:
            esc.write(75);
            which_command = 0;
            break;
        case 5:
            esc.write(85);
            which_command = 0;
            break;*/
    }
  front = pulseIn(D3, HIGH);// Count how long the pulse is high in microseconds
  //back = pulseIn(D5, HIGH);
  if(front != 0){ // If we get a reading that isn't zero, let's print it
       front = front/20; // 10usec = 1 cm of distance for LIDAR-Lite
  	   Particle.publish("right", String(front), PRIVATE);
  }
  else{
      Particle.publish("right is zero");
  }
  
  Input = front;
  myPID.Compute();
  wheels.write(90 + Output);
  //Particle.publish("Output_right",String(Output),PRIVATE);
 /* if(back != 0){ // If we get a reading that isn't zero, let's print it
       back = back/20; // 10usec = 1 cm of distance for LIDAR-Lite
  	   Particle.publish("left", String(back), PRIVATE);
  }
   else{
      Particle.publish("left is zero");
  }*/
  //esc.write(100);
  
  /*if(front < 90) {
      Input = front;
      myPID.Compute();
      wheels.write(90 - Output);
 // Particle.publish("Output_right",String(Output),PRIVATE);
  }*/
  /*if(back < 50) {
      Input = back;
      myPID.Compute();
      wheels.write(90 + Output);
 // Particle.publish("Output_left",String(Output),PRIVATE);
  } //Delay so we don't overload the serial port*/
  double A=analogRead(A0)*3.3/4095;
  //  Particle.publish("A5",String(A),PRIVATE);
    float out=0;
    //int out1=0;
    if(A>2)
    {
        A=1;
    }
    else
    {
        A=0;
    }
    if (B != A) 
   { 
      B = A;
      float out1 = millis() - t;
      float out = 28*(1000/out1);
      Particle.publish("Speed1",String(out),PRIVATE);
     // Particle.publish("Speed",String(out1),PRIVATE);
      t = millis();
     // Particle.publish("Time2",String(t),PRIVATE);
    //Particle.publish("A",String(A),PRIVATE);
    }
  //}
    
    delay(1000);
}

int lightLED(String cmd) {
    if(cmd == "ON") {
      //  digitalWrite(D7, HIGH);
    which_command=1;
    return 1;
    }
    else if(cmd == "OFF") {
      //  digitalWrite(D7, LOW);
    which_command=2;
    return 2;
    }
}
/*int speed(String cmd){
    if(cmd == "85")
    {
        which_command=85;
        return 85;
    }
    else if(cmd == "75")
    {
        which_command=75;
        return 75;
    }
    else if(cmd == "65")
    {
        which_command=65;
        return 65;
    }
    else if(cmd == "55")
    {
        which_command=55;
        return 55;
    }    
    else if(cmd == "45")
    {
        which_command=45;
        return 45;
    }
    else if(cmd == "35")
    {
        which_command=35;
        return 35;
    }
    else if(cmd == "25")
    {
        which_command=25;
        return 25;
    }
    else if(cmd == "15")
    {
        which_command=15;
        return 15;
    }
    else if(cmd == "5")
    {
        which_command=5;
        return 5;
    }
}*/



