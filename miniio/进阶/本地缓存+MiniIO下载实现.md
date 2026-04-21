# 本地缓存 + MiniIO 下载实现

## 核心思路

实现本地缓存 + MiniIO 下载的核心思路是：

1. **检查本地是否存在文件**：首先检查本地缓存目录中是否存在请求的文件
2. **如果存在**：直接返回本地文件
3. **如果不存在**：从 MiniIO 下载文件到本地缓存，然后返回

这种模式可以提高文件访问速度，减少对 MiniIO 服务器的请求压力，特别适合频繁访问相同文件的场景。

## 实现方案

### 1. 配置类

```java
import io.minio.MinioClient;

public class MinioConfig {
    private static final String ENDPOINT = "http://localhost:9000";
    private static final String ACCESS_KEY = "your-access-key";
    private static final String SECRET_KEY = "your-secret-key";
    private static final String BUCKET_NAME = "my-bucket";
    
    public static MinioClient getMinioClient() {
        return MinioClient.builder()
                .endpoint(ENDPOINT)
                .credentials(ACCESS_KEY, SECRET_KEY)
                .build();
    }
    
    public static String getBucketName() {
        return BUCKET_NAME;
    }
}
```

### 2. 工具类

```java
import io.minio.GetObjectArgs;
import io.minio.MinioClient;

import java.io.*;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

public class MinioUtil {
    private static final String CACHE_DIR = "D:\\minio-cache";
    
    static {
        // 确保缓存目录存在
        Path cachePath = Paths.get(CACHE_DIR);
        if (!Files.exists(cachePath)) {
            try {
                Files.createDirectories(cachePath);
            } catch (IOException e) {
                e.printStackTrace();
            }
        }
    }
    
    /**
     * 获取文件：先检查本地缓存，没有则从 MiniIO 下载
     */
    public static File getFile(String objectName) throws Exception {
        // 构建本地缓存文件路径
        Path localFilePath = Paths.get(CACHE_DIR, objectName);
        File localFile = localFilePath.toFile();
        
        // 检查本地是否存在
        if (localFile.exists()) {
            System.out.println("从本地缓存获取文件: " + objectName);
            return localFile;
        }
        
        // 从 MiniIO 下载
        System.out.println("从 MiniIO 下载文件: " + objectName);
        downloadFromMinio(objectName, localFile);
        return localFile;
    }
    
    /**
     * 从 MiniIO 下载文件到本地
     */
    private static void downloadFromMinio(String objectName, File localFile) throws Exception {
        MinioClient minioClient = MinioConfig.getMinioClient();
        String bucketName = MinioConfig.getBucketName();
        
        // 确保父目录存在
        if (!localFile.getParentFile().exists()) {
            localFile.getParentFile().mkdirs();
        }
        
        // 从 MiniIO 下载
        try (InputStream in = minioClient.getObject(
                GetObjectArgs.builder()
                        .bucket(bucketName)
                        .object(objectName)
                        .build());
             OutputStream out = new FileOutputStream(localFile)) {
            
            byte[] buffer = new byte[1024];
            int bytesRead;
            while ((bytesRead = in.read(buffer)) != -1) {
                out.write(buffer, 0, bytesRead);
            }
        }
    }
    
    /**
     * 上传文件到 MiniIO
     */
    public static void uploadFile(String objectName, File file) throws Exception {
        MinioClient minioClient = MinioConfig.getMinioClient();
        String bucketName = MinioConfig.getBucketName();
        
        // 上传文件到 MiniIO
        minioClient.uploadObject(
                io.minio.UploadObjectArgs.builder()
                        .bucket(bucketName)
                        .object(objectName)
                        .filename(file.getAbsolutePath())
                        .build());
        
        // 更新本地缓存
        Path localFilePath = Paths.get(CACHE_DIR, objectName);
        File localFile = localFilePath.toFile();
        
        // 确保父目录存在
        if (!localFile.getParentFile().exists()) {
            localFile.getParentFile().mkdirs();
        }
        
        // 复制文件到缓存
        try (InputStream in = new FileInputStream(file);
             OutputStream out = new FileOutputStream(localFile)) {
            
            byte[] buffer = new byte[1024];
            int bytesRead;
            while ((bytesRead = in.read(buffer)) != -1) {
                out.write(buffer, 0, bytesRead);
            }
        }
        
        System.out.println("文件上传成功: " + objectName);
    }
    
    /**
     * 清理本地缓存
     */
    public static void clearCache() {
        File cacheDir = new File(CACHE_DIR);
        if (cacheDir.exists()) {
            deleteDirectory(cacheDir);
            cacheDir.mkdirs();
            System.out.println("缓存清理成功");
        }
    }
    
    /**
     * 删除目录
     */
    private static void deleteDirectory(File directory) {
        File[] files = directory.listFiles();
        if (files != null) {
            for (File file : files) {
                if (file.isDirectory()) {
                    deleteDirectory(file);
                } else {
                    file.delete();
                }
            }
        }
        directory.delete();
    }
}
```

### 3. 测试类

```java
import java.io.File;

public class MinioTest {
    public static void main(String[] args) {
        try {
            // 测试上传文件
            File testFile = new File("D:\\test.txt");
            MinioUtil.uploadFile("test.txt", testFile);
            
            // 第一次获取（从 MiniIO 下载）
            File file1 = MinioUtil.getFile("test.txt");
            System.out.println("第一次获取文件路径: " + file1.getAbsolutePath());
            
            // 第二次获取（从本地缓存）
            File file2 = MinioUtil.getFile("test.txt");
            System.out.println("第二次获取文件路径: " + file2.getAbsolutePath());
            
            // 清理缓存
            MinioUtil.clearCache();
            
            // 第三次获取（从 MiniIO 下载）
            File file3 = MinioUtil.getFile("test.txt");
            System.out.println("第三次获取文件路径: " + file3.getAbsolutePath());
            
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
```

## 缓存管理策略

### 1. 缓存过期机制

添加缓存过期机制，定期清理过期文件：

```java
/**
 * 清理过期缓存
 * @param maxAge 最大缓存时间（毫秒）
 */
public static void cleanExpiredCache(long maxAge) {
    File cacheDir = new File(CACHE_DIR);
    if (cacheDir.exists()) {
        cleanExpiredCache(cacheDir, maxAge);
    }
}

private static void cleanExpiredCache(File directory, long maxAge) {
    File[] files = directory.listFiles();
    if (files != null) {
        long now = System.currentTimeMillis();
        for (File file : files) {
            if (file.isDirectory()) {
                cleanExpiredCache(file, maxAge);
            } else {
                if (now - file.lastModified() > maxAge) {
                    file.delete();
                    System.out.println("删除过期缓存: " + file.getAbsolutePath());
                }
            }
        }
    }
}
```

### 2. 缓存大小限制

设置缓存目录大小限制，当达到限制时清理最旧的文件：

```java
/**
 * 清理缓存以控制大小
 * @param maxSize 最大缓存大小（字节）
 */
public static void cleanCacheBySize(long maxSize) {
    File cacheDir = new File(CACHE_DIR);
    if (cacheDir.exists()) {
        long currentSize = getDirectorySize(cacheDir);
        if (currentSize > maxSize) {
            List<File> fileList = new ArrayList<>();
            collectFiles(cacheDir, fileList);
            
            // 按最后修改时间排序
            fileList.sort(Comparator.comparingLong(File::lastModified));
            
            long bytesToDelete = currentSize - maxSize;
            long bytesDeleted = 0;
            
            for (File file : fileList) {
                long fileSize = file.length();
                if (bytesDeleted < bytesToDelete) {
                    file.delete();
                    bytesDeleted += fileSize;
                    System.out.println("删除缓存文件: " + file.getAbsolutePath() + " (" + fileSize + " bytes)");
                } else {
                    break;
                }
            }
        }
    }
}

private static long getDirectorySize(File directory) {
    long size = 0;
    File[] files = directory.listFiles();
    if (files != null) {
        for (File file : files) {
            if (file.isDirectory()) {
                size += getDirectorySize(file);
            } else {
                size += file.length();
            }
        }
    }
    return size;
}

private static void collectFiles(File directory, List<File> fileList) {
    File[] files = directory.listFiles();
    if (files != null) {
        for (File file : files) {
            if (file.isDirectory()) {
                collectFiles(file, fileList);
            } else {
                fileList.add(file);
            }
        }
    }
}
```

## 错误处理与重试机制

添加错误处理和重试机制，提高系统的可靠性：

```java
/**
 * 从 MiniIO 下载文件到本地（带重试）
 */
private static void downloadFromMinio(String objectName, File localFile) throws Exception {
    MinioClient minioClient = MinioConfig.getMinioClient();
    String bucketName = MinioConfig.getBucketName();
    
    // 确保父目录存在
    if (!localFile.getParentFile().exists()) {
        localFile.getParentFile().mkdirs();
    }
    
    int maxRetries = 3;
    int retryCount = 0;
    Exception lastException = null;
    
    while (retryCount < maxRetries) {
        try {
            // 从 MiniIO 下载
            try (InputStream in = minioClient.getObject(
                    GetObjectArgs.builder()
                            .bucket(bucketName)
                            .object(objectName)
                            .build());
                 OutputStream out = new FileOutputStream(localFile)) {
                
                byte[] buffer = new byte[1024];
                int bytesRead;
                while ((bytesRead = in.read(buffer)) != -1) {
                    out.write(buffer, 0, bytesRead);
                }
            }
            return; // 成功下载，退出循环
        } catch (Exception e) {
            lastException = e;
            retryCount++;
            System.out.println("下载失败，重试 " + retryCount + "/" + maxRetries + ": " + e.getMessage());
            Thread.sleep(1000 * retryCount); // 指数退避
        }
    }
    
    throw lastException; // 所有重试都失败，抛出最后一个异常
}
```

## 实际应用场景

### 1. 图片服务器

在图片服务器中，可以使用本地缓存 + MiniIO 下载的模式：

- 当用户请求图片时，首先检查本地缓存
- 如果缓存存在，直接返回
- 如果缓存不存在，从 MiniIO 下载并缓存
- 定期清理过期缓存

### 2. 静态资源服务

对于静态资源（如 CSS、JS、字体文件等）：
- 首次请求时从 MiniIO 下载并缓存
- 后续请求直接从缓存返回
- 当资源更新时，通过版本号或时间戳触发重新下载

### 3. 大数据分析

在大数据分析场景中：
- 从 MiniIO 下载数据集到本地缓存
- 分析过程中使用本地缓存的文件
- 分析完成后可以保留或清理缓存

## 性能优化

1. **并行下载**：对于大文件或多个文件，可以使用并行下载提高速度
2. **断点续传**：支持断点续传，避免网络中断导致的重复下载
3. **压缩传输**：对于文本文件，可以启用压缩传输减少网络流量
4. **缓存预热**：在系统启动时，预加载常用文件到缓存
5. **异步下载**：对于非关键文件，可以使用异步下载方式

## 总结

本地缓存 + MiniIO 下载的模式是一种高效的文件访问方案，特别适合频繁访问相同文件的场景。通过合理的缓存管理策略和错误处理机制，可以提高系统的性能和可靠性。

在实际应用中，你可以根据具体需求调整缓存策略，例如设置不同的缓存过期时间、缓存大小限制等，以达到最佳的性能效果。