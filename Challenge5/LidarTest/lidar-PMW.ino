#include <math.h>

unsigned long left;
unsigned long right;

void setup()
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
}

 
