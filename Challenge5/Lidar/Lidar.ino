
/*void setup()
{
  //Serial.begin(9600); // Start serial communications
  pinMode(D2, OUTPUT); // Set pin 2 as trigger pin of left lidar
  pinMode(D3, INPUT); // Set pin 3 as monitor pin
  digitalWrite(D2, LOW); // Set trigger LOW for continuous read
  pinMode(D4, OUTPUT); // Set pin 4 as trigger pin of right lidar
  pinMode(D5, INPUT); // Set pin 5 as monitor pin
  digitalWrite(D4, LOW);
}

void loop()
{
  left = pulseIn(D3, HIGH);// Count how long the pulse is high in microseconds
  right = pulseIn(D5, HIGH);
  if(left != 0){ // If we get a reading that isn't zero, let's print it
       left = left/10; // 10usec = 1 cm of distance for LIDAR-Lite
       Particle.publish("left", String(left), PRIVATE);
  }
 
  if(right != 0){ // If we get a reading that isn't zero, let's print it
       right = right/10; // 10usec = 1 cm of distance for LIDAR-Lite
       Particle.publish("right", String(right), PRIVATE);
  }

  delay(5000); //Delay so we don't overload the serial port
}*/

#include "pid/pid.h"
#include <math.h>

Servo wheels; // servo for turning the wheels
Servo esc; // not actually a servo, but controlled like one!
bool startup = true; // used to ensure startup only happens once
int startupDelay = 1000; // time to pause at each calibration step
double maxSpeedOffset = 45; // maximum speed magnitude, in servo 'degrees'
double maxWheelOffset = 85; // maximum wheel turn magnitude, in servo 'degrees'

unsigned long front;
unsigned long back;

//Define Variables we'll be connecting to
double Setpoint, Input, Output;
double Kp = 2;
double Ki = 0.05;
double Kd = 0.5;

//Specify the links and initial tuning parameters
PID myPID(&Input, &Output, &Setpoint,Kp,Ki,Kd, PID::DIRECT);

void setup()
{
  wheels.attach(D0); // initialize wheel servo to Digital IO Pin #8
  esc.attach(D1); // initialize ESC to Digital IO Pin #9
  //calibrateESC();
  pinMode(D7, OUTPUT);
  Particle.function("fun_test", lightLED);
  
  Particle.variable("Lidar_right", &front, INT);
  Particle.variable("Lidar_left", &back, INT);
  
  //Serial.begin(9600); // Start serial communications
  pinMode(D2, OUTPUT); // Set pin 2 as trigger pin of left lidar
  pinMode(D3, INPUT); // Set pin 3 as monitor pin
  digitalWrite(D2, LOW); // Set trigger LOW for continuous read
  pinMode(D4, OUTPUT); // Set pin 4 as trigger pin of right lidar
  pinMode(D5, INPUT); // Set pin 5 as monitor pin
  digitalWrite(D4, LOW);
  
  //initialize the variables we're linked to
  //Input = analogRead(3);
  esc.write(90);
  wheels.write(90);
  Setpoint = 50;
  myPID.SetOutputLimits(-50, 50);
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

/*void calibrateESC(){
    esc.write(180); // full backwards
    delay(startupDelay);
    esc.write(0); // full forwards
    delay(startupDelay);
    esc.write(90); // neutral
    delay(startupDelay);
    esc.write(90); // reset the ESC to neutral (non-moving) value
}*/

void loop()
{
  //esc.write(70);
  front = pulseIn(D3, HIGH);// Count how long the pulse is high in microseconds
  back = pulseIn(D5, HIGH);
  if(front != 0){ // If we get a reading that isn't zero, let's print it
       front = front/20; // 10usec = 1 cm of distance for LIDAR-Lite
       Particle.publish("right", String(front), PRIVATE);
  }
  else{
    //  Particle.publish("Right is zero");
  }
 
  if(back != 0){ // If we get a reading that isn't zero, let's print it
       back = back/20; // 10usec = 1 cm of distance for LIDAR-Lite
       Particle.publish("left", String(back), PRIVATE);
  }
   else{
    //  Particle.publish("left is zero");
  }
  //esc.write(100);
  
  
  if(front < 50) {
      Input = front;
      myPID.Compute();
      wheels.write(90 + Output);
  //Particle.publish("Output_right",String(Output),PRIVATE);
  }
  if(back < 50) {
      Input = back;
      myPID.Compute();
      wheels.write(90 - Output);
 // Particle.publish("Output_left",String(Output),PRIVATE);
  }
//   Input = back;
//   myPID.Compute();
//   wheels.write(90 - Output);
//   Particle.publish("Output",String(Output),PRIVATE);

   delay(1000); //Delay so we don't overload the serial port
}

int lightLED(String cmd) {
    if(cmd == "ON") {
       // digitalWrite(D7, HIGH);
       esc.write(120);
        return 111;
    }
    if(cmd == "OFF") {
    //    digitalWrite(D7, LOW);
    esc.write(90);
        return 000;
    }
    /*if(cmd == "80")
    {
        esc.write(80);
    }
    if(cmd == "70")
    {
        esc.write(70);
    }
    if(cmd == "60")
    {
        esc.write(60);
    }
    if(cmd == "50")
    {
        esc.write(50);
    }    
    if(cmd == "40")
    {
        esc.write(40);
    }*/
}




 
