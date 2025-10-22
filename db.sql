-- MySQL dump 10.13  Distrib 8.0.36, for Linux (x86_64)
--
-- Host: 127.0.0.1    Database: db-notification
-- ------------------------------------------------------
-- Server version	8.0.34

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `Notifications`
--

DROP TABLE IF EXISTS `Notifications`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Notifications` (
  `id` int NOT NULL AUTO_INCREMENT,
  `userId` int NOT NULL,
  `message` varchar(255) NOT NULL,
  `type` varchar(255) NOT NULL,
  `status` varchar(255) DEFAULT 'unread',
  `createdAt` datetime DEFAULT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Notifications`
--

LOCK TABLES `Notifications` WRITE;
/*!40000 ALTER TABLE `Notifications` DISABLE KEYS */;
/*!40000 ALTER TABLE `Notifications` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-10-22 18:02:16
-- MySQL dump 10.13  Distrib 8.0.36, for Linux (x86_64)
--
-- Host: 127.0.0.1    Database: db-workorder
-- ------------------------------------------------------
-- Server version	8.0.34

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `ChecklistItems`
--

DROP TABLE IF EXISTS `ChecklistItems`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ChecklistItems` (
  `id` int NOT NULL AUTO_INCREMENT,
  `workOrderId` int NOT NULL,
  `assignedToUserId` int DEFAULT NULL,
  `price` float NOT NULL DEFAULT '0',
  `task` varchar(255) NOT NULL,
  `completed` tinyint(1) DEFAULT '0',
  `assignedAt` datetime DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `workOrderId` (`workOrderId`),
  CONSTRAINT `ChecklistItems_ibfk_1` FOREIGN KEY (`workOrderId`) REFERENCES `WorkOrders` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ChecklistItems`
--

LOCK TABLES `ChecklistItems` WRITE;
/*!40000 ALTER TABLE `ChecklistItems` DISABLE KEYS */;
INSERT INTO `ChecklistItems` VALUES (1,1,0,100000,'Rửa xe',1,NULL,'2025-10-22 06:54:34','2025-10-22 07:43:38'),(2,1,0,500000,'Thay dầu',1,NULL,'2025-10-22 06:54:34','2025-10-22 07:46:49'),(3,2,0,2000000,'Thay 4 lốp',1,NULL,'2025-10-22 07:56:46','2025-10-22 07:57:05'),(4,2,0,0,'Rửa xe',1,NULL,'2025-10-22 07:56:46','2025-10-22 07:58:13'),(5,2,0,200000,'Thay dầu',0,NULL,'2025-10-22 07:56:46','2025-10-22 07:56:46'),(6,2,0,200000,'Vệ sinh khử mùi',0,NULL,'2025-10-22 07:56:46','2025-10-22 07:56:46'),(7,2,0,0,'Chỉnh lại thước lái',0,NULL,'2025-10-22 07:56:46','2025-10-22 07:56:46');
/*!40000 ALTER TABLE `ChecklistItems` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `WorkOrders`
--

DROP TABLE IF EXISTS `WorkOrders`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `WorkOrders` (
  `id` int NOT NULL AUTO_INCREMENT,
  `title` varchar(255) NOT NULL,
  `description` text,
  `status` varchar(255) DEFAULT 'pending',
  `appointmentId` int NOT NULL,
  `dueDate` datetime DEFAULT NULL,
  `totalPrice` float NOT NULL DEFAULT '0',
  `createdById` int NOT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `WorkOrders`
--

LOCK TABLES `WorkOrders` WRITE;
/*!40000 ALTER TABLE `WorkOrders` DISABLE KEYS */;
INSERT INTO `WorkOrders` VALUES (1,'Phiếu dịch vụ - Người dùng A','Bảo dưỡng xe định kỳ ','pending',1,'2026-01-01 00:00:00',600000,3,'2025-10-22 06:54:34','2025-10-22 06:54:34'),(2,'Phiếu dịch vụ - Người dùng A','Tư vấn sửa xe, thay thế phụ tùng','pending',2,'2025-10-22 00:00:00',2000000,3,'2025-10-22 07:56:46','2025-10-22 07:58:13');
/*!40000 ALTER TABLE `WorkOrders` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-10-22 18:02:16
-- MySQL dump 10.13  Distrib 8.0.36, for Linux (x86_64)
--
-- Host: 127.0.0.1    Database: db-inventory
-- ------------------------------------------------------
-- Server version	8.0.34

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `Parts`
--

DROP TABLE IF EXISTS `Parts`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Parts` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `partNumber` varchar(255) DEFAULT NULL,
  `quantity` int DEFAULT '0',
  `minStock` int DEFAULT '5',
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `partNumber` (`partNumber`)
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Parts`
--

LOCK TABLES `Parts` WRITE;
/*!40000 ALTER TABLE `Parts` DISABLE KEYS */;
INSERT INTO `Parts` VALUES (1,'Xinhan Spirit Beast L27 chính hãng','XNL27',107,10,'2025-10-21 04:04:16','2025-10-22 11:00:17'),(2,'Phuộc RCB C2 đen ty vàng cho Sirius, Jupiter chính hãng','071066',2000,100,'2025-10-21 04:04:54','2025-10-21 04:04:54'),(3,'Phụ tùng 1','00001',100,10,'2025-10-22 10:57:23','2025-10-22 10:57:23'),(4,'Phụ tùng 2','00002',2000,100,'2025-10-22 10:57:37','2025-10-22 10:57:37'),(5,'Phụ tùng 3','00003',900,40,'2025-10-22 10:57:52','2025-10-22 10:57:52'),(6,'Phụ tùng 4','00004',10,1,'2025-10-22 10:58:04','2025-10-22 10:58:04'),(7,'Phụ tùng 5','00005',10,0,'2025-10-22 10:58:15','2025-10-22 10:58:15'),(8,'Phụ tùng 6','00006',220,15,'2025-10-22 10:58:30','2025-10-22 10:58:30'),(9,'Phụ tùng 7','00007',150,15,'2025-10-22 10:58:47','2025-10-22 10:58:47'),(10,'Phụ tùng 8','00008',300,10,'2025-10-22 10:59:01','2025-10-22 10:59:01'),(11,'Phụ tùng 9','00009',600,20,'2025-10-22 10:59:19','2025-10-22 10:59:19');
/*!40000 ALTER TABLE `Parts` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `partsUsages`
--

DROP TABLE IF EXISTS `partsUsages`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `partsUsages` (
  `id` int NOT NULL AUTO_INCREMENT,
  `workOrderId` int NOT NULL,
  `quantityUsed` int NOT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  `partId` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `partId` (`partId`),
  CONSTRAINT `partsUsages_ibfk_1` FOREIGN KEY (`partId`) REFERENCES `Parts` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `partsUsages`
--

LOCK TABLES `partsUsages` WRITE;
/*!40000 ALTER TABLE `partsUsages` DISABLE KEYS */;
/*!40000 ALTER TABLE `partsUsages` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `stockLogs`
--

DROP TABLE IF EXISTS `stockLogs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `stockLogs` (
  `id` int NOT NULL AUTO_INCREMENT,
  `changeType` enum('IN','OUT') NOT NULL,
  `quantity` int NOT NULL,
  `reason` varchar(255) DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  `partId` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `partId` (`partId`),
  CONSTRAINT `stockLogs_ibfk_1` FOREIGN KEY (`partId`) REFERENCES `Parts` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=14 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `stockLogs`
--

LOCK TABLES `stockLogs` WRITE;
/*!40000 ALTER TABLE `stockLogs` DISABLE KEYS */;
INSERT INTO `stockLogs` VALUES (1,'IN',100,NULL,'2025-10-21 04:04:16','2025-10-21 04:04:16',1),(2,'IN',2000,NULL,'2025-10-21 04:04:54','2025-10-21 04:04:54',2),(3,'IN',25,'Ok Nhập','2025-10-21 04:05:22','2025-10-21 04:05:22',1),(4,'IN',100,NULL,'2025-10-22 10:57:23','2025-10-22 10:57:23',3),(5,'IN',2000,NULL,'2025-10-22 10:57:37','2025-10-22 10:57:37',4),(6,'IN',900,NULL,'2025-10-22 10:57:52','2025-10-22 10:57:52',5),(7,'IN',10,NULL,'2025-10-22 10:58:04','2025-10-22 10:58:04',6),(8,'IN',10,NULL,'2025-10-22 10:58:15','2025-10-22 10:58:15',7),(9,'IN',220,NULL,'2025-10-22 10:58:30','2025-10-22 10:58:30',8),(10,'IN',150,NULL,'2025-10-22 10:58:47','2025-10-22 10:58:47',9),(11,'IN',300,NULL,'2025-10-22 10:59:01','2025-10-22 10:59:01',10),(12,'IN',600,NULL,'2025-10-22 10:59:19','2025-10-22 10:59:19',11),(13,'OUT',18,'Hết hạn sử dụng','2025-10-22 11:00:17','2025-10-22 11:00:17',1);
/*!40000 ALTER TABLE `stockLogs` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-10-22 18:02:16
-- MySQL dump 10.13  Distrib 8.0.36, for Linux (x86_64)
--
-- Host: 127.0.0.1    Database: db-booking
-- ------------------------------------------------------
-- Server version	8.0.34

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `Appointments`
--

DROP TABLE IF EXISTS `Appointments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Appointments` (
  `id` int NOT NULL AUTO_INCREMENT,
  `userId` int NOT NULL,
  `serviceCenterId` int NOT NULL,
  `vehicleId` int DEFAULT NULL,
  `date` datetime NOT NULL,
  `timeSlot` varchar(255) NOT NULL,
  `status` varchar(255) DEFAULT 'pending',
  `notes` varchar(255) DEFAULT NULL,
  `createdById` int NOT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `serviceCenterId` (`serviceCenterId`),
  CONSTRAINT `Appointments_ibfk_1` FOREIGN KEY (`serviceCenterId`) REFERENCES `ServiceCenters` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Appointments`
--

LOCK TABLES `Appointments` WRITE;
/*!40000 ALTER TABLE `Appointments` DISABLE KEYS */;
INSERT INTO `Appointments` VALUES (1,2,1,1,'2026-01-01 00:00:00','08:00','confirmed','Bảo dưỡng xe định kỳ ',3,'2025-10-22 04:07:32','2025-10-22 04:43:48'),(2,2,2,2,'2025-10-22 00:00:00','08:00','confirmed','Tư vấn sửa xe, thay thế phụ tùng',3,'2025-10-22 07:54:30','2025-10-22 07:55:04');
/*!40000 ALTER TABLE `Appointments` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `ServiceCenters`
--

DROP TABLE IF EXISTS `ServiceCenters`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ServiceCenters` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `address` varchar(255) NOT NULL,
  `phone` varchar(255) NOT NULL,
  `email` varchar(255) DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ServiceCenters`
--

LOCK TABLES `ServiceCenters` WRITE;
/*!40000 ALTER TABLE `ServiceCenters` DISABLE KEYS */;
INSERT INTO `ServiceCenters` VALUES (1,'Trung tâm A','Hà Nội','0981248922','trungtama@gmail.com','2025-10-22 04:07:00','2025-10-22 04:07:00'),(2,'Trung tâm B','Đà Nẵng','0123456780','trungtamb@gmail.com','2025-10-22 07:53:45','2025-10-22 07:53:45'),(3,'Trung tâm A1','Hà Nội','0981248922','trungtama@gmail.com','2025-10-22 04:07:00','2025-10-22 04:07:00'),(4,'Trung tâm B1','Đà Nẵng','0123456780','trungtamb@gmail.com','2025-10-22 07:53:45','2025-10-22 07:53:45'),(5,'Trung tâm A2','Hà Nội','0981248922','trungtama@gmail.com','2025-10-22 04:07:00','2025-10-22 04:07:00'),(6,'Trung tâm B2','Đà Nẵng','0123456780','trungtamb@gmail.com','2025-10-22 07:53:45','2025-10-22 07:53:45'),(7,'Trung tâm A3','Hà Nội','0981248922','trungtama@gmail.com','2025-10-22 04:07:00','2025-10-22 04:07:00'),(8,'Trung tâm B3','Đà Nẵng','0123456780','trungtamb@gmail.com','2025-10-22 07:53:45','2025-10-22 07:53:45'),(9,'Trung tâm A4','Hà Nội','0981248922','trungtama@gmail.com','2025-10-22 04:07:00','2025-10-22 04:07:00'),(10,'Trung tâm B4','Đà Nẵng','0123456780','trungtamb@gmail.com','2025-10-22 07:53:45','2025-10-22 07:53:45'),(11,'Trung tâm A5','Hà Nội','0981248922','trungtama@gmail.com','2025-10-22 04:07:00','2025-10-22 04:07:00'),(12,'Trung tâm B5','Đà Nẵng','0123456780','trungtamb@gmail.com','2025-10-22 07:53:45','2025-10-22 07:53:45');
/*!40000 ALTER TABLE `ServiceCenters` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-10-22 18:02:16
-- MySQL dump 10.13  Distrib 8.0.36, for Linux (x86_64)
--
-- Host: 127.0.0.1    Database: db-vehicle
-- ------------------------------------------------------
-- Server version	8.0.34

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `Reminders`
--

DROP TABLE IF EXISTS `Reminders`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Reminders` (
  `id` int NOT NULL AUTO_INCREMENT,
  `vehicleId` int NOT NULL,
  `message` varchar(255) NOT NULL,
  `date` datetime NOT NULL,
  `completed` tinyint(1) DEFAULT '0',
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `vehicleId` (`vehicleId`),
  CONSTRAINT `Reminders_ibfk_1` FOREIGN KEY (`vehicleId`) REFERENCES `Vehicles` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Reminders`
--

LOCK TABLES `Reminders` WRITE;
/*!40000 ALTER TABLE `Reminders` DISABLE KEYS */;
INSERT INTO `Reminders` VALUES (1,1,'Thay nhớt lần 1','2025-11-11 00:00:00',0,'2025-10-21 07:57:05','2025-10-21 07:57:05');
/*!40000 ALTER TABLE `Reminders` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Vehicles`
--

DROP TABLE IF EXISTS `Vehicles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Vehicles` (
  `id` int NOT NULL AUTO_INCREMENT,
  `licensePlate` varchar(255) NOT NULL,
  `brand` varchar(255) NOT NULL,
  `model` varchar(255) DEFAULT NULL,
  `year` int DEFAULT NULL,
  `userId` int NOT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `licensePlate` (`licensePlate`)
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Vehicles`
--

LOCK TABLES `Vehicles` WRITE;
/*!40000 ALTER TABLE `Vehicles` DISABLE KEYS */;
INSERT INTO `Vehicles` VALUES (1,'29 AC 99999','Honda','CRV',2025,2,'2025-10-21 03:40:22','2025-10-21 03:40:22'),(2,'24 AK 12345','Honda','Civic',2025,2,'2025-10-22 02:51:58','2025-10-22 02:51:58'),(3,'29 AC 11111','Toyota','Camry',2025,9,'2025-10-22 08:55:40','2025-10-22 08:55:40'),(4,'49 AC 49999','Honda','CRB',2025,10,'2025-10-21 03:40:22','2025-10-21 03:40:22'),(5,'50 AK 52345','Honda','Vios',2025,2,'2025-10-22 02:51:58','2025-10-22 02:51:58'),(6,'69 AC 11111','Toyota','Fortuner',2025,9,'2025-10-22 08:55:40','2025-10-22 08:55:40'),(7,'29 AC 94599','Honda','CRV',2025,2,'2025-10-21 03:40:22','2025-10-21 03:40:22'),(8,'20 AK 82345','Honda','Civic',2025,2,'2025-10-22 02:51:58','2025-10-22 02:51:58'),(9,'29 AC 91111','Toyota','Camry',2025,11,'2025-10-22 08:55:40','2025-10-22 08:55:40'),(10,'99 AC 10999','Honda','CRB',2025,10,'2025-10-21 03:40:22','2025-10-21 03:40:22'),(11,'50 AK 11345','Honda','Vios',2025,11,'2025-10-22 02:51:58','2025-10-22 02:51:58'),(12,'19 AC 22111','Toyota','Fortuner',2025,11,'2025-10-22 08:55:40','2025-10-22 08:55:40');
/*!40000 ALTER TABLE `Vehicles` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-10-22 18:02:16
-- MySQL dump 10.13  Distrib 8.0.36, for Linux (x86_64)
--
-- Host: 127.0.0.1    Database: db-auth
-- ------------------------------------------------------
-- Server version	8.0.34

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `RefreshTokens`
--

DROP TABLE IF EXISTS `RefreshTokens`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `RefreshTokens` (
  `id` int NOT NULL AUTO_INCREMENT,
  `token` varchar(255) NOT NULL,
  `expiryDate` datetime NOT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  `userId` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `userId` (`userId`),
  CONSTRAINT `RefreshTokens_ibfk_1` FOREIGN KEY (`userId`) REFERENCES `Users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `RefreshTokens`
--

LOCK TABLES `RefreshTokens` WRITE;
/*!40000 ALTER TABLE `RefreshTokens` DISABLE KEYS */;
INSERT INTO `RefreshTokens` VALUES (1,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiaWF0IjoxNzYxMDE3NzQyLCJleHAiOjE3NjE2MjI1NDJ9.qRBCUXq66e0fzDwZfEWM4dyH1EMAajlQlK8p9kQziqs','2025-10-28 03:35:42','2025-10-21 03:35:42','2025-10-21 03:35:42',1),(2,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiaWF0IjoxNzYxMDE3OTMzLCJleHAiOjE3NjE2MjI3MzN9.eAkn9Md3VXLvjo-lZN768IHr1K2qORnw8KsfvPsiKms','2025-10-28 03:38:53','2025-10-21 03:38:53','2025-10-21 03:38:53',1),(3,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiaWF0IjoxNzYxMDIyMDk4LCJleHAiOjE3NjE2MjY4OTh9.8TwYceV7Mctv5FkxNWnXM-pr4MlnHGmoMliPL9thLJw','2025-10-28 04:48:18','2025-10-21 04:48:18','2025-10-21 04:48:18',1),(4,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiaWF0IjoxNzYxMDMxMTkzLCJleHAiOjE3NjE2MzU5OTN9.e5p4ihiN54RmrOTzEhNLeCqEVpohKGZCqxmQAdqh6G4','2025-10-28 07:19:53','2025-10-21 07:19:53','2025-10-21 07:19:53',1),(5,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiaWF0IjoxNzYxMDMyMjQzLCJleHAiOjE3NjE2MzcwNDN9.sV7A_vQMLBkhN1QBpWhIW4ESk8uuDPtKKQrjTwdraSk','2025-10-28 07:37:23','2025-10-21 07:37:23','2025-10-21 07:37:23',1),(6,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiaWF0IjoxNzYxMDMyMzI1LCJleHAiOjE3NjE2MzcxMjV9.reK8omqlJHffLD6_DSXdEISqtnSREE-rQYCNqyc2r2g','2025-10-28 07:38:45','2025-10-21 07:38:45','2025-10-21 07:38:45',1),(7,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiaWF0IjoxNzYxMDMyNDQzLCJleHAiOjE3NjE2MzcyNDN9.APzn9Z2wOzAepuPTBsPQtOjrVnWBQHho0qvDe4Tta3w','2025-10-28 07:40:43','2025-10-21 07:40:43','2025-10-21 07:40:43',1),(8,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MywiaWF0IjoxNzYxMDMyNTk0LCJleHAiOjE3NjE2MzczOTR9.6VG3r4pzvwimjCJ6nauLbK6xvOi7BOOZbOId6aPLQO8','2025-10-28 07:43:14','2025-10-21 07:43:14','2025-10-21 07:43:14',3),(9,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MywiaWF0IjoxNzYxMDMyNzkwLCJleHAiOjE3NjE2Mzc1OTB9.0Dfl3uMzvD-HS7Uy_A4qihs7c1XEl0ajIZCyeZMxV9Y','2025-10-28 07:46:30','2025-10-21 07:46:30','2025-10-21 07:46:30',3),(10,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MywiaWF0IjoxNzYxMDMzMjk3LCJleHAiOjE3NjE2MzgwOTd9.GSUqUjzR3yIFLgn77hR2nP4XdwQCPYpPPsexqfCJ-oY','2025-10-28 07:54:57','2025-10-21 07:54:57','2025-10-21 07:54:57',3);
/*!40000 ALTER TABLE `RefreshTokens` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Users`
--

DROP TABLE IF EXISTS `Users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `username` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `role` varchar(255) DEFAULT 'user',
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `username` (`username`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=14 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Users`
--

LOCK TABLES `Users` WRITE;
/*!40000 ALTER TABLE `Users` DISABLE KEYS */;
INSERT INTO `Users` VALUES (1,'Nhân viên 1','nhanvien1@gmail.com','$2b$10$gHbPkTc1Db3X7GS4P/9l.e1ICdtC7B9ub5ghT.OktlQOfNVIaDQIW','staff','2025-10-21 03:35:26','2025-10-21 03:35:26'),(2,'Khách hàng A','nguoidunga@gmail.com','$2b$10$wBYatdbmPUhMlJVYO5lcj.WSduOi74U.3Qgn8dZ4yfESzwAVZ1kYm','user','2025-10-21 03:39:51','2025-10-22 08:52:09'),(3,'Quản trị viên','administrator@example.com','$2b$10$YJqezdhyOPyzOgw7wJL84OSgQ2h//4WKBWUi8y42Su9Ssjb/kGXbm','admin','2025-10-21 07:43:07','2025-10-21 07:43:07'),(4,'Khách hàng B','khachhangb@gmail.com','$2b$10$hBmKbbeSP86HmP6mEtDPNOBWAfIvtmU6yOQXY23h5tWKR0icyUtDm','user','2025-10-22 04:08:09','2025-10-22 04:08:09'),(5,'Khách hàng C','khachhangc@gmail.com','$2b$10$u1uWQO0itUL6vjAZ2nQt/.7OP5hOzpawXHR3EXXoGWxT/lZDFya5.','user','2025-10-22 08:51:36','2025-10-22 08:51:36'),(6,'Nhân viên 2','nhanvien2@gmail.com','$2b$10$gI0f3vLnjQ.fBvDtsYh5XOtPWAw1GJ4uvdMVUB8nCT/R/6cZBQDYS','staff','2025-10-22 08:52:31','2025-10-22 08:52:31'),(7,'Nhân viên 3','nhanvien3@gmail.com','$2b$10$.wei.QHGP6bMbV7tXKj/P.LC0THEitRR9mVzer2XwYQA6nitq5n5y','staff','2025-10-22 08:52:52','2025-10-22 08:52:52'),(8,'Khách hàng D','khachhangd@gmail.com','$2b$10$tNj5q34Si.DnuLxfhzedAOkuZP7zp2eeWXonByhTzR8RKlTCkwioK','user','2025-10-22 08:53:15','2025-10-22 08:53:15'),(9,'Khách hàng E','khachhange@gmail.com','$2b$10$tLyu9nou1opPzsjdvwYJw.LfMOqFJPnng2RyrQZVw3kHEJOVFGf0O','user','2025-10-22 08:53:47','2025-10-22 08:53:47'),(10,'Khách hàng F','khachhangf@gmail.com','$2b$10$RrDw9jJo6qXjWGrcYLa71ODRch0uNn7Ka7iS4rt8KTNjF2ZNs49Be','user','2025-10-22 08:54:09','2025-10-22 08:54:09'),(11,'Khách hàng G','khachhangg@gmail.com','$2b$10$E9Fa6mFBXMT84VmajeTO5.DbgiWvch/J9jqRK3BlHr9uccmPXNaei','user','2025-10-22 08:54:34','2025-10-22 08:54:34'),(12,'Khách hàng H','khachhangh@gmail.com','$2b$10$E9Fa6mFBXMT84VmajeTO5.DbgiWvch/J9jqRK3BlHr9uccmPXNaei','user','2025-10-22 08:54:34','2025-10-22 08:54:34'),(13,'Khách hàng K','khachhangk@gmail.com','$2b$10$E9Fa6mFBXMT84VmajeTO5.DbgiWvch/J9jqRK3BlHr9uccmPXNaei','user','2025-10-22 08:54:34','2025-10-22 08:54:34');
/*!40000 ALTER TABLE `Users` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-10-22 18:02:16
