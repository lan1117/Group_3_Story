# EC544 Challenge8 -- Autonomous Driving with Remote Monitoring and Control



In this challenge, we created a system for autonomous driving crawler and remote monitoring and controling crawler. And we added FPV real-time video stream and RSS localization at the same time.

## Devices Configuration

Two ultrasonics and one Lidar are used for reading distances of two sides and the front.
Arduinos and XBees are used for XBee wireless communication between XBees.

XBee API mode: RSSI data transition for localization
XBee AT mode : Senser data transition for autonomous control and remote command control

## Autonomous Driving:

### Hallway/Corner Detection

Since we have two sonic on each side, it is easy to detect distances on both sides. 

* Hallway: data from both sonics are less than 200, which means there are walls on both sides. PID control is implemented to make it go straight line.

* Corner: when data from both sonics are greater than 250, that means there are no walls on any side; when only data from right side sonic is greater than 250, then the crawler is at a corner too. In those two conditions, we constructed backward-and-forward-right-turn method to complete corner passing.

### Elevator Passing

We have tried to use RSS localization to tell the crawler that it is at elevator right now(since "elevator" case is the same as "no right wall" case), but RSS signal is so unstable and unreliable that may miss detection.

Finally we applied millis() to add delay to let the car pass the elevator instead of turning right.

## Remote Monitor and Control(Manually Driving)

### Nodejs and HTML

Socket.io is applied to realize communication between HTML and JavaScript, and XBee wireless communication is used to connect JavaScript and Anduino. Togother, we realized remote control from webpage command(keyboard pressing) to crawler.

Apart from that, real-time position of crawler is shown on the webpage with a map of PHO 4th floor.

### FPV real-time video stream

MJPG video stream method is constructed to show real-time video of road condition.

## Reference
https://wolfpaulus.com/journal/embedded/raspberrypi_webcam/
http://www.360doc.com/content/12/0728/20/2852909_226997438.shtml