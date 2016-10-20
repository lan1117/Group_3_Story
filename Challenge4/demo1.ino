#include <math.h>

const int PULLUP_RES = 9100;

const double BETA = 3950;

const double THERMISTOR_RES = 90000;

const double THERMISTOR_NOM_TEMP = 20;

void setup()
{
    Particle.subscribe("hook-response/Temp", myHandler, MY_DEVICES);
}

void loop()
{
    thermister_temp(analogRead(3));
    delay(10000);
}

void thermister_temp(int aval)
{
    double R, T;
    
    R = (double) PULLUP_RES / ( ( (4950) / (double) aval ) - 1 );
    
    T = 1 / ( ( 1 / (THERMISTOR_NOM_TEMP + 273.15)) + ( ( 1/ BETA) * log(R / THERMISTOR_RES) ) );
    
    T -= 273.15;
    
    //Spark.publish("Temperature", String(T) + " *C");
    Particle.publish("Temp_P3", String(T) + " *C", PRIVATE);
    Particle.publish("Temp", "3" + String(T), PRIVATE);
}

void myHandler(const char *event, const char *data) {
  // Handle the integration response

}
      



/*void loop() {
  // Get some data
  String data = String(10);
  // Trigger the integration
  Particle.publish("Temp", data, PRIVATE);
  // Wait 60 seconds
  delay(60000);
}
      
          

void setup() {
  // Subscribe to the integration response event
  Particle.subscribe("hook-response/Temp", myHandler, MY_DEVICES);
}

void myHandler(const char *event, const char *data) {
  // Handle the integration response
}*/
          

