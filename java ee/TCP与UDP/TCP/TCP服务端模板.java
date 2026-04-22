import java.io.*;
import java.net.*;

public class TCPServer {
    private static final int PORT = 8888;
    private static final int MAX_CLIENTS = 10;
    
    public static void main(String[] args) {
        ServerSocket serverSocket = null;
        
        try {
            serverSocket = new ServerSocket(PORT);
            System.out.println("TCP服务端已启动，监听端口: " + PORT);
            System.out.println("等待客户端连接...");
            
            while (true) {
                Socket clientSocket = serverSocket.accept();
                System.out.println("客户端已连接: " + clientSocket.getInetAddress());
                
                new ClientHandler(clientSocket).start();
            }
            
        } catch (IOException e) {
            System.err.println("服务端异常: " + e.getMessage());
        } finally {
            if (serverSocket != null && !serverSocket.isClosed()) {
                try {
                    serverSocket.close();
                } catch (IOException e) {
                    System.err.println("关闭服务端失败: " + e.getMessage());
                }
            }
        }
    }
    
    private static class ClientHandler extends Thread {
        private Socket clientSocket;
        private BufferedReader in;
        private PrintWriter out;
        
        public ClientHandler(Socket socket) {
            this.clientSocket = socket;
        }
        
        @Override
        public void run() {
            try {
                in = new BufferedReader(new InputStreamReader(clientSocket.getInputStream()));
                out = new PrintWriter(clientSocket.getOutputStream(), true);
                
                String inputLine;
                while ((inputLine = in.readLine()) != null) {
                    System.out.println("收到消息: " + inputLine);
                    
                    String response = processMessage(inputLine);
                    out.println(response);
                    
                    if ("bye".equalsIgnoreCase(inputLine)) {
                        break;
                    }
                }
                
            } catch (IOException e) {
                System.err.println("客户端处理异常: " + e.getMessage());
            } finally {
                closeResources();
            }
        }
        
        private String processMessage(String message) {
            return "服务端回复: " + message;
        }
        
        private void closeResources() {
            try {
                if (in != null) in.close();
                if (out != null) out.close();
                if (clientSocket != null && !clientSocket.isClosed()) {
                    clientSocket.close();
                }
                System.out.println("客户端连接已关闭");
            } catch (IOException e) {
                System.err.println("关闭资源失败: " + e.getMessage());
            }
        }
    }
}