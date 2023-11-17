import "dotenv/config";
import {Server} from "socket.io";
const PORT = process.env.PORT ?? 8000;
const ioserver = new Server(parseInt(PORT,10),{cors:{origin:"https://p2pfiletransfer-sigma.vercel.app"}});

ioserver.use(function(socket,next){
    const userID = socket.handshake.auth.userID;
    socket.userID = userID;
    next();
});

ioserver.on("connection",function(socket){
    console.log("socket connected id:", socket.userID);
    socket.join(socket.userID);

    socket.on("checkpeerexistence",function({peerID}){
        const peerexist = ioserver.sockets.adapter.rooms.has(peerID)
        if(peerexist){
            socket.emit("peerexists",{peerexists:true});
        }else{
            socket.emit("peerexists",{peerexists:false});
        }
    })
    socket.on("offer",function({offer,peerID}){
        socket.to(peerID).emit("offer",{offer,peerID:socket.userID});
    });
    socket.on("answer",function({answer,peerID}){
        socket.to(peerID).emit("answer",{answer});
    });
    socket.on("icecandidate",function({icecandidate,peerID}){
        socket.to(peerID).emit("icecandidate",{icecandidate});
    });
    socket.on("disconnect",function(){
        console.log(`${socket.userID} disconnected`);
    })
});

console.log("listening on port",PORT);
