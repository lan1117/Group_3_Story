#include <SoftwareSerial.h>
SoftwareSerial XBee(2, 3); // RX, TX

// which analog pin to connect
#define THERMISTORPIN A0         
// resistance at 25 degrees C
#define THERMISTORNOMINAL 10000      
// temp. for nominal resistance (almost always 25 C)
#define TEMPERATURENOMINAL 25   
// how many samples to take and average, more takes longer
// but is more 'smooth'
#define BCOEFFICIENT 3950
// the value of the 'other' resistor
#define SERIESRESISTOR 9100    
 
void setup(void) {
  Serial.begin(9600);
  XBee.begin(9600);
  //analogReference(EXTERNAL);
}
 
void loop(void) {
  float data;

  data = analogRead(THERMISTORPIN);
 
  Serial.print("Analog reading "); 
  Serial.println(data);
 
  // convert the value to resistance
  data = (1023 / data) - 1;
  data = SERIESRESISTOR / data;
  Serial.print("Thermistor resistance "); 
  Serial.println(data);
 
  float steinhart;
  steinhart = data / THERMISTORNOMINAL;     // (R/Ro)
  steinhart = log(steinhart);                  // ln(R/Ro)
  steinhart /= BCOEFFICIENT;                   // 1/B * ln(R/Ro)
  steinhart += 1.0 / (TEMPERATURENOMINAL + 273.15); // + (1/To)
  steinhart = 1.0 / steinhart;                 // Invert
  steinhart -= 273.15;                         // convert to C
 
  Serial.print("Temperature "); 
  Serial.print(steinhart);
  Serial.println(" *C");
  XBee.write("2:");
  XBee.print(steinhart);
  XBee.write("\n");
  //XBee.write(" *C\n");
 
  delay(2000);
}
