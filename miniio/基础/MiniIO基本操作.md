# MiniIO 基本操作

## 命令行工具 mc

`mc` 是 MiniIO 提供的命令行工具，用于与 MiniIO 服务器交互。

### 安装 mc

- **Windows**：下载 `mc.exe` 可执行文件
- **Linux**：`wget https://dl.min.io/client/mc/release/linux-amd64/mc && chmod +x mc`
- **macOS**：`curl -O https://dl.min.io/client/mc/release/darwin-amd64/mc && chmod +x mc`

### 配置 mc

1. **添加 MiniIO 服务器**：
   ```bash
   mc alias set myminio http://localhost:9000 minioadmin minioadmin
   ```

2. **验证配置**：
   ```bash
   mc ls myminio
   ```

## 基本操作

### 1. 管理存储桶

- **创建存储桶**：
  ```bash
  mc mb myminio/my-bucket
  ```

- **列出存储桶**：
  ```bash
  mc ls myminio
  ```

- **删除存储桶**：
  ```bash
  mc rb myminio/my-bucket
  ```

### 2. 管理对象

- **上传文件**：
  ```bash
  mc cp local-file.txt myminio/my-bucket/
  ```

- **下载文件**：
  ```bash
  mc cp myminio/my-bucket/remote-file.txt local-file.txt
  ```

- **列出对象**：
  ```bash
  mc ls myminio/my-bucket
  ```

- **删除对象**：
  ```bash
  mc rm myminio/my-bucket/file.txt
  ```

- **复制对象**：
  ```bash
  mc cp myminio/my-bucket/source.txt myminio/my-bucket/destination.txt
  ```

### 3. 管理权限

- **设置存储桶权限**：
  ```bash
  mc policy set public myminio/my-bucket
  ```

- **查看存储桶权限**：
  ```bash
  mc policy get myminio/my-bucket
  ```

## Java 客户端操作

### 依赖配置

**Maven**：
```xml
<dependency>
    <groupId>io.minio</groupId>
    <artifactId>minio</artifactId>
    <version>8.5.3</version>
</dependency>
```

**Gradle**：
```groovy
implementation 'io.minio:minio:8.5.3'
```

### 基本操作代码

#### 1. 初始化客户端

```java
import io.minio.MinioClient;

public class MinioExample {
    public static void main(String[] args) {
        try {
            MinioClient minioClient = MinioClient.builder()
                    .endpoint("http://localhost:9000")
                    .credentials("minioadmin", "minioadmin")
                    .build();
            
            System.out.println("MinioClient initialized successfully");
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
```

#### 2. 创建存储桶

```java
import io.minio.MakeBucketArgs;

// ...
try {
    boolean found = minioClient.bucketExists(
            io.minio.BucketExistsArgs.builder().bucket("my-bucket").build());
    
    if (!found) {
        minioClient.makeBucket(
                MakeBucketArgs.builder().bucket("my-bucket").build());
        System.out.println("Bucket created successfully");
    } else {
        System.out.println("Bucket already exists");
    }
} catch (Exception e) {
    e.printStackTrace();
}
```

#### 3. 上传文件

```java
import io.minio.UploadObjectArgs;

// ...
try {
    minioClient.uploadObject(
            UploadObjectArgs.builder()
                    .bucket("my-bucket")
                    .object("test.txt")
                    .filename("D:\\test.txt")
                    .build());
    System.out.println("File uploaded successfully");
} catch (Exception e) {
    e.printStackTrace();
}
```

#### 4. 下载文件

```java
import io.minio.GetObjectArgs;

// ...
try {
    try (InputStream in = minioClient.getObject(
            GetObjectArgs.builder()
                    .bucket("my-bucket")
                    .object("test.txt")
                    .build());
         OutputStream out = new FileOutputStream("D:\\downloaded-test.txt")) {
        
        byte[] buffer = new byte[1024];
        int bytesRead;
        while ((bytesRead = in.read(buffer)) != -1) {
            out.write(buffer, 0, bytesRead);
        }
        
        System.out.println("File downloaded successfully");
    }
} catch (Exception e) {
    e.printStackTrace();
}
```

#### 5. 列出对象

```java
import io.minio.ListObjectsArgs;
import io.minio.Result;
import io.minio.messages.Item;

// ...
try {
    Iterable<Result<Item>> results = minioClient.listObjects(
            ListObjectsArgs.builder()
                    .bucket("my-bucket")
                    .build());
    
    for (Result<Item> result : results) {
        Item item = result.get();
        System.out.println(item.objectName() + " (size: " + item.size() + ")");
    }
} catch (Exception e) {
    e.printStackTrace();
}
```

## 浏览器操作

除了命令行和代码，你还可以通过 MiniIO 控制台进行操作：

1. **登录控制台**：`http://localhost:9001`
2. **选择存储桶**：点击左侧的 "Buckets"，选择一个存储桶
3. **上传文件**：点击 "Upload" 按钮，选择文件上传
4. **下载文件**：点击文件旁边的 "Download" 按钮
5. **删除文件**：点击文件旁边的 "Delete" 按钮
6. **查看文件**：点击文件名称查看文件详情

## 总结

通过本教程，你已经学会了 MiniIO 的基本操作，包括：

1. 使用 `mc` 命令行工具管理存储桶和对象
2. 使用 Java 客户端与 MiniIO 交互
3. 通过浏览器控制台进行操作

这些基本操作是使用 MiniIO 的基础，掌握它们后，你可以在自己的项目中灵活使用 MiniIO 进行对象存储。

在接下来的进阶教程中，我们将学习如何实现本地缓存 + MiniIO 下载的逻辑，以及如何处理更复杂的场景。