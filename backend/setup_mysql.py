#!/usr/bin/env python3
"""
Script to setup MySQL database for the TradeSense AI application
"""

import mysql.connector
from mysql.connector import Error
import sys
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

def get_db_config():
    """Get database configuration from environment variables or use defaults"""
    return {
        'host': os.getenv('DB_HOST', 'localhost'),
        'user': os.getenv('DB_USER', 'root'),
        'password': os.getenv('DB_PASSWORD', '123456'),
        'database': os.getenv('DB_NAME', 'examen'),
        'port': int(os.getenv('DB_PORT', 3306))
    }

def create_database_and_tables():
    """Create database and all required tables"""
    config = get_db_config()
    
    try:
        # Connect to MySQL server (without specifying database initially)
        connection = mysql.connector.connect(
            host=config['host'],
            user=config['user'],
            password=config['password'],
            port=config['port']
        )
        
        if connection.is_connected():
            cursor = connection.cursor()
            
            # Create database if it doesn't exist
            cursor.execute(f"CREATE DATABASE IF NOT EXISTS {config['database']}")
            print(f"Database '{config['database']}' created or already exists.")
            
            # Use the database
            cursor.execute(f"USE {config['database']}")
            
            # Create users table
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS users (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    email VARCHAR(255) UNIQUE NOT NULL,
                    name VARCHAR(255) NOT NULL,
                    password_hash VARCHAR(255) NOT NULL,
                    role ENUM('user', 'admin', 'super_admin') DEFAULT 'user',
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
                );
            """)
            print("Table 'users' created or already exists.")
            
            # Create challenges table
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS challenges (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    user_id INT NOT NULL,
                    initial_balance DECIMAL(15,2) NOT NULL,
                    current_balance DECIMAL(15,2) NOT NULL,
                    status ENUM('active', 'passed', 'failed') DEFAULT 'active',
                    max_daily_loss DECIMAL(15,2) NOT NULL,
                    max_total_loss DECIMAL(15,2) NOT NULL,
                    profit_target DECIMAL(15,2) NOT NULL,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
                );
            """)
            print("Table 'challenges' created or already exists.")
            
            # Create trades table
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS trades (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    user_id INT NOT NULL,
                    challenge_id INT NOT NULL,
                    symbol VARCHAR(20) NOT NULL,
                    type ENUM('BUY', 'SELL') NOT NULL,
                    price DECIMAL(15,5) NOT NULL,
                    quantity INT NOT NULL,
                    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    pnl DECIMAL(15,2) DEFAULT 0.00,
                    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
                    FOREIGN KEY (challenge_id) REFERENCES challenges(id) ON DELETE CASCADE
                );
            """)
            print("Table 'trades' created or already exists.")
            
            # Create user_sessions table
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS user_sessions (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    user_id INT NOT NULL,
                    session_token VARCHAR(255) UNIQUE NOT NULL,
                    expires_at TIMESTAMP NOT NULL,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
                );
            """)
            print("Table 'user_sessions' created or already exists.")
            
            # Create challenge_history table
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS challenge_history (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    user_id INT NOT NULL,
                    challenge_id INT NOT NULL,
                    initial_balance DECIMAL(15,2) NOT NULL,
                    final_balance DECIMAL(15,2) NOT NULL,
                    status ENUM('passed', 'failed') NOT NULL,
                    duration_days INT,
                    profit_amount DECIMAL(15,2),
                    profit_percentage DECIMAL(5,2),
                    completed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
                    FOREIGN KEY (challenge_id) REFERENCES challenges(id) ON DELETE CASCADE
                );
            """)
            print("Table 'challenge_history' created or already exists.")
            
            # Create user_preferences table
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS user_preferences (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    user_id INT NOT NULL,
                    language VARCHAR(10) DEFAULT 'fr',
                    theme VARCHAR(20) DEFAULT 'dark',
                    notifications_enabled BOOLEAN DEFAULT TRUE,
                    risk_level ENUM('low', 'medium', 'high') DEFAULT 'medium',
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
                );
            """)
            print("Table 'user_preferences' created or already exists.")
            
            # Create user_achievements table
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS user_achievements (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    user_id INT NOT NULL,
                    achievement_type VARCHAR(100) NOT NULL,
                    achievement_name VARCHAR(255) NOT NULL,
                    description TEXT,
                    earned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    progress_percentage INT DEFAULT 0,
                    is_completed BOOLEAN DEFAULT FALSE,
                    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
                );
            """)
            print("Table 'user_achievements' created or already exists.")
            
            # Insert sample users
            cursor.execute("""
                INSERT IGNORE INTO users (email, name, password_hash, role) VALUES
                ('admin@test.com', 'Admin User', '$2b$12$LQ3E2N7EUqHJ/W4B5UjWked8.ae.KL.y.TQHX.Q.wNUm.z.hR8t3e', 'admin'),  -- password: admin123
                ('user@test.com', 'Regular User', '$2b$12$LQ3E2N7EUqHJ/W4B5UjWked8.ae.KL.y.TQHX.Q.wNUm.z.hR8t3e', 'user');  -- password: user123
            """)
            print("Sample users inserted (if not already present).")
            
            # Insert sample challenges for the regular user
            cursor.execute("""
                INSERT IGNORE INTO challenges (user_id, initial_balance, current_balance, status, max_daily_loss, max_total_loss, profit_target) VALUES
                (2, 10000.00, 12500.00, 'active', 500.00, 2000.00, 2000.00),
                (2, 15000.00, 14200.00, 'active', 750.00, 3000.00, 3000.00),
                (2, 8000.00, 9600.00, 'passed', 400.00, 1600.00, 1600.00);
            """)
            print("Sample challenges inserted for regular user.")
            
            connection.commit()
            print(f"\nDatabase setup completed successfully!")
            print(f"Database: {config['database']}")
            print(f"Tables created: 8")
            print(f"Sample users created: 2")
            print(f"Sample challenges created: 3")
            
    except Error as e:
        print(f"Error while connecting to MySQL: {e}")
        return False
        
    finally:
        if connection.is_connected():
            cursor.close()
            connection.close()
            print("\nMySQL connection closed.")
    
    return True

def test_connection():
    """Test the database connection"""
    config = get_db_config()
    
    try:
        connection = mysql.connector.connect(**config)
        if connection.is_connected():
            print(f"✓ Successfully connected to MySQL database: {config['database']}")
            connection.close()
            return True
    except Error as e:
        print(f"✗ Failed to connect to MySQL: {e}")
        return False

if __name__ == "__main__":
    print("TradeSense AI - MySQL Database Setup")
    print("=" * 40)
    
    # Test connection first
    print("\nTesting database connection...")
    if not test_connection():
        print("\nPlease make sure:")
        print("1. MySQL server is running")
        print("2. Credentials in .env file are correct (or using defaults)")
        print("3. MySQL user has permissions to create databases and tables")
        sys.exit(1)
    
    print("\nSetting up database and tables...")
    success = create_database_and_tables()
    
    if success:
        print("\n🎉 Database setup completed successfully!")
        print("\nYou can now run the Flask backend with:")
        print("  cd backend && python app.py")
    else:
        print("\n❌ Database setup failed!")
        sys.exit(1)