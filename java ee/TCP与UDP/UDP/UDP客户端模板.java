import java.io.*;
import java.net.*;
import java.util.Scanner;

public class UDPClient {
    private static final String SERVER_HOST = "localhost";
    private static final int SERVER_PORT = 9999;
    private static final int BUFFER_SIZE = 1024;
    private static final int TIMEOUT = 5000;
    
    public static void main(String[] args) {
        DatagramSocket socket = null;
        Scanner scanner = new Scanner(System.in);
        
        try {
            socket = new DatagramSocket();
            socket.setSoTimeout(TIMEOUT);
            
            InetAddress serverAddress = InetAddress.getByName(SERVER_HOST);
            System.out.println("UDP客户端已启动，目标服务端: " + SERVER_HOST + ":" + SERVER_PORT);
            System.out.println("请输入消息（输入'bye'退出）:");
            
            byte[] buffer = new byte[BUFFER_SIZE];
            
            while (scanner.hasNextLine()) {
                String message = scanner.nextLine().trim();
                
                if (message.isEmpty()) {
                    continue;
                }
                
                byte[] sendData = message.getBytes();
                DatagramPacket sendPacket = new DatagramPacket(
                    sendData, 
                    sendData.length, 
                    serverAddress, 
                    SERVER_PORT
                );
                
                socket.send(sendPacket);
                System.out.println("已发送: " + message);
                
                try {
                    DatagramPacket receivePacket = new DatagramPacket(buffer, buffer.length);
                    socket.receive(receivePacket);
                    
                    String response = new String(
                        receivePacket.getData(), 
                        0, 
                        receivePacket.getLength()
                    );
                    
                    System.out.println("收到回复: " + response);
                    
                } catch (SocketTimeoutException e) {
                    System.out.println("请求超时，未收到服务端回复");
                }
                
                if ("bye".equalsIgnoreCase(message)) {
                    break;
                }
            }
            
        } catch (UnknownHostException e) {
            System.err.println("未知主机: " + e.getMessage());
        } catch (SocketException e) {
            System.err.println("Socket异常: " + e.getMessage());
        } catch (IOException e) {
            System.err.println("IO异常: " + e.getMessage());
        } finally {
            if (socket != null && !socket.isClosed()) {
                socket.close();
            }
            if (scanner != null) scanner.close();
            System.out.println("UDP客户端已关闭");
        }
    }
}