//
//  ViewController.swift
//  challenge3
//
//  Created by julerrie on 16/10/8.
//  Copyright © 2016年 julerrie. All rights reserved.
//

import UIKit

import SocketIO

let socket = SocketIOClient(socketURL: URL(string: "ws://localhost:3000")!,config: [.log(true),.forcePolling(true)])

var bStates = [0,0,0,0];



class ViewController: UIViewController {
    @IBOutlet weak var bulb1: UIImageView!
    @IBOutlet weak var bulb2: UIImageView!
    @IBOutlet weak var bulb3: UIImageView!
    @IBOutlet weak var bulb4: UIImageView!
    override func viewDidLoad() {
        super.viewDidLoad()
        socket.connect()
        print("bStates is:");
        print(bStates);
        var states=0;
        socket.on("updated bStates"){msg, ack in
            print("data is:");
            print(msg);
            
            states = Int((msg[0] as! NSString).intValue);
            bStates[0] = states/1000;
            bStates[1] = (states%1000)/100;
            bStates[2] = ((states%1000)%100)/10;
            bStates[3] = ((states%1000)%100)%10;
            print("bStates is:");
            print(bStates);
            self.getStat();
        };
        // Do any additional setup after loading the view, typically from a nib.
    }

    override func didReceiveMemoryWarning() {
        super.didReceiveMemoryWarning()
        // Dispose of any resources that can be recreated.
    }
    @IBAction func on1(_ sender: UIButton) {
        socket.connect();
        onBulb(num: 1);
        self.getStat();
    }
    @IBAction func on2(_ sender: UIButton) {
        socket.connect();
        onBulb(num: 2);
        self.getStat();
    }
    @IBAction func on3(_ sender: UIButton) {
        socket.connect();
        onBulb(num: 3);
        self.getStat();
    }
    @IBAction func on4(_ sender: UIButton) {
        socket.connect();
        onBulb(num: 4);
        self.getStat();
    }
    @IBAction func off1(_ sender: UIButton) {
        socket.connect();
        offBulb(num: 1);
        self.getStat();
    }
    @IBAction func off2(_ sender: UIButton) {
        socket.connect();
        offBulb(num: 2);
        self.getStat();
    }
    @IBAction func off3(_ sender: UIButton) {
        socket.connect();
        offBulb(num: 3);
        self.getStat();
    }
    @IBAction func off4(_ sender: UIButton) {
        socket.connect();
        offBulb(num: 4);
        self.getStat();
    }

    
    
    func onBulb(num: Int){
    /*var image = document.getElementById(bulb);
    if(image.src = "Style/2.png"){
    image.src = "Style/2.png";*/
        bStates[num-1]=1;
        let sendstate: String;
        let newstate1 = bStates[0]*1000 + bStates[1]*100;
        print("newstate1 is");
        print(newstate1);
        let newstate2 = bStates[2]*10 + bStates[3];
        print("newstate2 is");
        print(newstate2);
        let newstate = newstate1 + newstate2;
        print("newstate is");
        print(newstate);
       // if newstate<1000 {
            sendstate = String(format: "%04d", newstate);
         //   print("sendstate is");
          //  print(sendstate);
       // }
       // else{
         //   sendstate=String(newstate);
          //  print("sendstate is");
           // print(sendstate);
       // }
    socket.emit("bStates",sendstate);
    }
    
    func offBulb (num: Int) {
    /*var image = document.getElementById(bulb);
    if(image.src = "Style/2.png"){
    image.src = "Style/1.png";*/
        bStates[num-1]=0;
        let newstate1 = bStates[0]*1000 + bStates[1]*100;
        let newstate2 = bStates[2]*10 + bStates[3];
        let newstate = newstate1 + newstate2;
        let sendstate:String = String(format: "%04d", newstate);
        print("sendstate is");
        print(sendstate);
        socket.emit("bStates",sendstate);
    }
    
    func getStat(){
        if(bStates[0] == 0){bulb1.image=UIImage(named:"1.png");} else {bulb1.image=UIImage(named:"2.png");}
        if(bStates[1] == 0){bulb2.image=UIImage(named:"1.png");} else {bulb2.image=UIImage(named:"2.png");}
        if(bStates[2] == 0){bulb3.image=UIImage(named:"1.png");} else {bulb3.image=UIImage(named:"2.png");}
        if(bStates[3] == 0){bulb4.image=UIImage(named:"1.png");} else {bulb4.image=UIImage(named:"2.png");}
        }
}
