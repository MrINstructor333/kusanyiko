#!/usr/bin/env python3
"""
Script to generate self-signed SSL certificates for development
"""
import os
import subprocess
import sys

def generate_ssl_certificates():
    """Generate self-signed SSL certificates for HTTPS development"""
    cert_dir = "ssl_certs"
    
    if not os.path.exists(cert_dir):
        os.makedirs(cert_dir)
    
    cert_file = os.path.join(cert_dir, "cert.pem")
    key_file = os.path.join(cert_dir, "key.pem")
    
    # Generate self-signed certificate
    cmd = [
        "openssl", "req", "-x509", "-newkey", "rsa:4096", "-keyout", key_file,
        "-out", cert_file, "-days", "365", "-nodes", "-subj",
        "/C=US/ST=State/L=City/O=Organization/OU=OrgUnit/CN=10.181.172.168"
    ]
    
    try:
        subprocess.run(cmd, check=True)
        print(f"✅ SSL certificates generated:")
        print(f"   Certificate: {cert_file}")
        print(f"   Key: {key_file}")
        return cert_file, key_file
    except subprocess.CalledProcessError:
        print("❌ Error: OpenSSL not found or failed to generate certificates")
        print("Please install OpenSSL or use alternative method")
        return None, None
    except FileNotFoundError:
        print("❌ Error: OpenSSL not found on this system")
        print("Please install OpenSSL:")
        print("  - Windows: Download from https://slproweb.com/products/Win32OpenSSL.html")
        print("  - Or use Windows Subsystem for Linux (WSL)")
        return None, None

if __name__ == "__main__":
    print("Generating SSL Certificates for HTTPS Development")
    print("=" * 50)
    generate_ssl_certificates()