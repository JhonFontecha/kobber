"""Portable trusted CA bundle; corporate certificates may use SSL_CERT_FILE."""
import os
import ssl
import certifi


def verified_context():
    return ssl.create_default_context(cafile=os.environ.get("SSL_CERT_FILE") or certifi.where())
