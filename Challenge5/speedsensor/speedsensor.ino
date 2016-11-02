// This #include statement was automatically added by the Particle IDE.
#include "SparkTime/SparkTime.h"

#include "math.h"

Servo wheels; // servo for turning the wheels
Servo esc; // not actually a servo, but controlled like one!
bool startup = true; // used to ensure startup only happens once
int startupDelay = 1000; // time to pause at each calibration step
double maxSpeedOffset = 45; // maximum speed magnitude, in servo 'degrees'
double maxWheelOffset = 85;// maximum wheel turn magnitude, in servo 'degrees'
int led2 = D7;
time_t t = 0;
double B=0;
void setup()
{
    wheels.attach(D0); // initialize wheel servo to Digital IO Pin #8
    esc.attach(D1); // initialize ESC to Digital IO Pin #9
    //esc.write(110);
    Particle.function("control", controldevice);
    pinMode(A0, INPUT);
    
    double B=analogRead(A0)*3.3/4095;
     t = millis();
     Particle.publish("time1",String(t),PRIVATE);
    pinMode(led2, OUTPUT);
   // pinMode(encoderLeftPin, INPUT);
//    attachInterrupt(0, doEncoderLeft, CHANGE);

  //  pinMode(encoderRightPin, INPUT);
//    attachInterrupt(1, doEncoderRight, CHANGE);
}

void loop()
{
   // esc.write(65);
    double A=analogRead(A0)*3.3/4095;
    Particle.publish("A5",String(A),PRIVATE);
    int out=0;
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
      out = millis() - t;
      Particle.publish("Time interval",String(out),PRIVATE);
      out = (55.9/2)*(1000/out);
      //float wheelSpeed = (55.9/24.0 * 1000/out);
      t = millis();
      Particle.publish("Time2",String(t),PRIVATE);
    Particle.publish("A",String(A),PRIVATE);
    
    }
    delay(1000);
  
}
int controldevice(String command)
{
    if (command=="on")
    {
        //esc.write(120);return 1;
        digitalWrite(led2, HIGH);
        return 1;
    }
    else if (command=="off") 
    {
      //  esc.write(90);
        return 0;
    }
    else
    {
        return -1;
        
    }
}