# EC544 Challenge7 -- Infectious Swarm

In this challenge, we created a swarm with the Arduino-XBee. The swarm can react to an “infection” triggered by a button push.

For each Arduino:

We tag every Arduino(XBee) with its serial address, which is unique to every Xbee.

Maintain a list of addresses of XBees that it can successfully hear from.

Whenever we add a few more new Xbees into the network, the election system can handle it by adding the address of new Xbees to the tail of the list.

## Election

This folder includes final code in the XBee.

## LED_debounce

This folder contains code for LED_debounce test. 

Reference:
http://www.arduino.cc/en/Tutorial/Debounce
