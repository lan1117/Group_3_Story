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
unsigned long lid;
//Define Variables we'll be connecting to
double Setpoint, Input, Output;
double Kp = 2;
double Ki = 0.05;
double Kd = 0.5;
int which_command = 0;

int lidar = 0;

//Specify the links and initial tuning parameters
PID myPID(&Input, &Output, &Setpoint,Kp,Ki,Kd, PID::DIRECT);

void setup()
{
  wheels.attach(D0); // initialize wheel servo to Digital IO Pin #8
  esc.attach(D1); // initialize ESC to Digital IO Pin #9
  //calibrateESC();
//   pinMode(D7, OUTPUT);
  Particle.function("fun_test", lightLED);
  Particle.function("fun_test1", speed);
//   Particle.variable("Lidar_right", &front, INT);
//   Particle.variable("Lidar_left", &back, INT);
  
  //Serial.begin(9600); // Start serial communications
  pinMode(D2, OUTPUT); // Set pin 2 as trigger pin of left lidar
  pinMode(D3, INPUT); // Set pin 3 as monitor pin
  digitalWrite(D2, LOW); // Set trigger LOW for continuous read

  //initialize the variables we're linked to
  //Input = analogRead(3);
  esc.write(60);
  wheels.write(90);
  Setpoint = 80;
  myPID.SetOutputLimits(-30, 30);
  myPID.SetMode(PID::AUTOMATIC);
}

//sonar
double getDistance(int pin){
  //8cm - 20cm
  int x1 = analogRead(pin);
  double Raw1 = (3.3/4095)*x1;
  double x2 = 3.3/512;
  double x3 = (Raw1/x2)*2.54;
  return x3;
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
//   switch (which_command) {
//         case 1:
//             digitalWrite(D7,HIGH);
//             which_command = 0;
//             break;

//         case 2:
//             digitalWrite(D7,LOW);
//             which_command = 0;
//             break;
//     }
  front = getDistance(1);// Count how long the pulse is high in microseconds
//   back = pulseIn(D5, HIGH);
  back = getDistance(4);
  if(front != 0){ // If we get a reading that isn't zero, let's print it
       //front = front/20;
  	   Particle.publish("right", String(front), PRIVATE);
  }
  else{
    //  Particle.publish("Right is zero");
  }
 
  if(back != 0){ // If we get a reading that isn't zero, let's print it
  	   Particle.publish("left", String(back), PRIVATE);
  }
   else{
    //  Particle.publish("left is zero");
  }
  //esc.write(100);
  lid = pulseIn(D3, HIGH);
  lid = lid / 20 ;
  if(lidar < 80) {
      esc.write(90);
  }
  else{
      esc.write(70);
  }
  
  if(front < 75) {
      Input = front;
      myPID.Compute();
      wheels.write(90 + Output);
  //Particle.publish("Output_right",String(Output),PRIVATE);
  }
  if(back < 75) {
      Input = back;
      myPID.Compute();
      wheels.write(90  - Output);
 // Particle.publish("Output_left",String(Output),PRIVATE);
  }
  if(front > 100 ){
      if(back > 100){
          wheels.write(90);
      }
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
    which_command=1;
    return 1;
    }
    else if(cmd == "OFF") {
    //    digitalWrite(D7, LOW);
    which_command=2;
    return 2;
    }
}
int speed(String cmd){
    if(cmd == "85")
    {
        esc.write(175);
        return 85;
    }
    else if(cmd == "75")
    {
        esc.write(165);
        return 75;
    }
    else if(cmd == "65")
    {
        esc.write(155);
        return 65;
    }
    else if(cmd == "55")
    {
        esc.write(145);
        return 55;
    }    
    else if(cmd == "45")
    {
        esc.write(135);
        return 45;
    }
    else if(cmd == "35")
    {
        esc.write(125);
        return 35;
    }
    else if(cmd == "25")
    {
        esc.write(115);
        return 25;
    }
    else if(cmd == "15")
    {
        esc.write(105);
        return 15;
    }
    else if(cmd == "5")
    {
        esc.write(95);
        return 5;
    }
}

