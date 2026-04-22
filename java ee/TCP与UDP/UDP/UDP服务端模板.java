import java.io.*;
import java.net.*;

public class UDPServer {
    private static final int PORT = 9999;
    private static final int BUFFER_SIZE = 1024;
    
    public static void main(String[] args) {
        DatagramSocket socket = null;
        
        try {
            socket = new DatagramSocket(PORT);
            System.out.println("UDP服务端已启动，监听端口: " + PORT);
            System.out.println("等待接收数据包...");
            
            byte[] buffer = new byte[BUFFER_SIZE];
            
            while (true) {
                DatagramPacket receivePacket = new DatagramPacket(buffer, buffer.length);
                socket.receive(receivePacket);
                
                String receivedMessage = new String(
                    receivePacket.getData(), 
                    0, 
                    receivePacket.getLength()
                );
                
                InetAddress clientAddress = receivePacket.getAddress();
                int clientPort = receivePacket.getPort();
                
                System.out.println("收到来自 " + clientAddress + ":" + clientPort + " 的消息: " + receivedMessage);
                
                String response = processMessage(receivedMessage);
                byte[] responseData = response.getBytes();
                
                DatagramPacket sendPacket = new DatagramPacket(
                    responseData, 
                    responseData.length, 
                    clientAddress, 
                    clientPort
                );
                
                socket.send(sendPacket);
                System.out.println("已发送回复: " + response);
                
                if ("bye".equalsIgnoreCase(receivedMessage)) {
                    System.out.println("客户端请求关闭连接");
                    break;
                }
            }
            
        } catch (SocketException e) {
            System.err.println("Socket异常: " + e.getMessage());
        } catch (IOException e) {
            System.err.println("IO异常: " + e.getMessage());
        } finally {
            if (socket != null && !socket.isClosed()) {
                socket.close();
                System.out.println("UDP服务端已关闭");
            }
        }
    }
    
    private static String processMessage(String message) {
        return "服务端回复: " + message;
    }
}