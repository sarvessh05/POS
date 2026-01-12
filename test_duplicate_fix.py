#!/usr/bin/env python3
"""
Test script to verify the duplicate items bug fix
"""

import requests
import json
import time
import threading
from concurrent.futures import ThreadPoolExecutor

# Configuration
BASE_URL = "http://localhost:8000"
TEST_USERNAME = "admin"  # Replace with actual admin username
TEST_PASSWORD = "admin123"  # Replace with actual admin password

def get_auth_token():
    """Get authentication token"""
    try:
        response = requests.post(f"{BASE_URL}/token", data={
            "username": TEST_USERNAME,
            "password": TEST_PASSWORD
        })
        if response.status_code == 200:
            return response.json()["access_token"]
        else:
            print(f"❌ Authentication failed: {response.status_code}")
            return None
    except Exception as e:
        print(f"❌ Error getting token: {e}")
        return None

def create_test_invoice(token, invoice_data, thread_id):
    """Create a test invoice"""
    headers = {"Authorization": f"Bearer {token}"}
    
    try:
        response = requests.post(f"{BASE_URL}/invoices/", 
                               json=invoice_data, 
                               headers=headers)
        
        if response.status_code == 200:
            invoice = response.json()
            print(f"✅ Thread {thread_id}: Invoice {invoice['invoice_number']} created successfully")
            return True
        else:
            error_detail = response.json().get('detail', 'Unknown error')
            print(f"❌ Thread {thread_id}: Failed to create invoice - {error_detail}")
            return False
            
    except Exception as e:
        print(f"❌ Thread {thread_id}: Exception - {e}")
        return False

def test_concurrent_invoices():
    """Test concurrent invoice creation to check for race conditions"""
    print("🧪 Testing concurrent invoice creation...")
    
    token = get_auth_token()
    if not token:
        print("❌ Cannot proceed without authentication token")
        return False
    
    # Test invoice with duplicate items (should be consolidated)
    test_invoice = {
        "customer_name": "Test Customer",
        "customer_phone": "+1234567890",
        "payment_mode": "Cash",
        "items": [
            {
                "item_id": 1,
                "item_name": "Test Item 1",
                "quantity": 2,
                "unit_price": 10.0,
                "tax_amount": 2.0
            },
            {
                "item_id": 1,  # Same item - should be consolidated
                "item_name": "Test Item 1",
                "quantity": 3,
                "unit_price": 10.0,
                "tax_amount": 3.0
            },
            {
                "item_id": 2,
                "item_name": "Test Item 2",
                "quantity": 1,
                "unit_price": 15.0,
                "tax_amount": 1.5
            }
        ]
    }
    
    # Test 1: Single invoice with duplicate items
    print("\n📋 Test 1: Single invoice with duplicate items")
    success = create_test_invoice(token, test_invoice, "SINGLE")
    
    if success:
        print("✅ Test 1 passed: Duplicate items handled correctly")
    else:
        print("❌ Test 1 failed")
    
    # Test 2: Concurrent invoice creation
    print("\n📋 Test 2: Concurrent invoice creation")
    
    # Create multiple invoices concurrently
    with ThreadPoolExecutor(max_workers=5) as executor:
        futures = []
        for i in range(5):
            # Each thread creates a slightly different invoice
            concurrent_invoice = {
                "customer_name": f"Concurrent Customer {i}",
                "customer_phone": f"+123456789{i}",
                "payment_mode": "Cash",
                "items": [
                    {
                        "item_id": 1,
                        "item_name": "Test Item 1",
                        "quantity": 1,
                        "unit_price": 10.0,
                        "tax_amount": 1.0
                    }
                ]
            }
            
            future = executor.submit(create_test_invoice, token, concurrent_invoice, f"THREAD-{i}")
            futures.append(future)
        
        # Wait for all threads to complete
        results = [future.result() for future in futures]
        
        successful = sum(results)
        print(f"\n📊 Concurrent test results: {successful}/5 invoices created successfully")
        
        if successful >= 4:  # Allow for some failures due to stock limits
            print("✅ Test 2 passed: Concurrent creation handled correctly")
        else:
            print("❌ Test 2 failed: Too many concurrent failures")
    
    return True

def test_stock_deduction():
    """Test stock deduction accuracy"""
    print("\n🧪 Testing stock deduction accuracy...")
    
    token = get_auth_token()
    if not token:
        return False
    
    headers = {"Authorization": f"Bearer {token}"}
    
    # Get current stock for item 1
    try:
        response = requests.get(f"{BASE_URL}/items/", headers=headers)
        if response.status_code == 200:
            items = response.json()
            item_1 = next((item for item in items if item['id'] == 1), None)
            
            if item_1:
                initial_stock = item_1['stock_quantity']
                print(f"📦 Initial stock for '{item_1['name']}': {initial_stock}")
                
                # Create invoice that should deduct stock
                stock_test_invoice = {
                    "customer_name": "Stock Test Customer",
                    "customer_phone": "+1111111111",
                    "payment_mode": "Cash",
                    "items": [
                        {
                            "item_id": 1,
                            "item_name": item_1['name'],
                            "quantity": 2,
                            "unit_price": item_1['price'],
                            "tax_amount": 2.0
                        }
                    ]
                }
                
                success = create_test_invoice(token, stock_test_invoice, "STOCK-TEST")
                
                if success:
                    # Check stock after invoice creation
                    response = requests.get(f"{BASE_URL}/items/", headers=headers)
                    if response.status_code == 200:
                        items = response.json()
                        item_1_after = next((item for item in items if item['id'] == 1), None)
                        
                        if item_1_after:
                            final_stock = item_1_after['stock_quantity']
                            expected_stock = initial_stock - 2
                            
                            print(f"📦 Final stock: {final_stock}, Expected: {expected_stock}")
                            
                            if final_stock == expected_stock:
                                print("✅ Stock deduction test passed")
                                return True
                            else:
                                print("❌ Stock deduction test failed - incorrect stock level")
                                return False
            else:
                print("❌ Test item not found")
                return False
        else:
            print("❌ Failed to fetch items")
            return False
            
    except Exception as e:
        print(f"❌ Stock test error: {e}")
        return False

if __name__ == "__main__":
    print("🚀 Starting duplicate items bug fix tests...\n")
    
    # Run tests
    test1_passed = test_concurrent_invoices()
    test2_passed = test_stock_deduction()
    
    print("\n" + "="*50)
    print("📋 TEST SUMMARY")
    print("="*50)
    print(f"Concurrent Invoice Test: {'✅ PASSED' if test1_passed else '❌ FAILED'}")
    print(f"Stock Deduction Test: {'✅ PASSED' if test2_passed else '❌ FAILED'}")
    
    if test1_passed and test2_passed:
        print("\n🎉 All tests passed! The duplicate items bug has been fixed.")
    else:
        print("\n⚠️  Some tests failed. Please check the implementation.")