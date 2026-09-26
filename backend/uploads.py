"""Bound uploads and expanded XLSX content before parsers allocate memory."""
import io
import zipfile
from fastapi import HTTPException

MAX_UPLOAD_BYTES = 25 * 1024 * 1024
MAX_EXPANDED_BYTES = 100 * 1024 * 1024


async def read_upload(file):
    data = await file.read(MAX_UPLOAD_BYTES + 1)
    if len(data) > MAX_UPLOAD_BYTES:
        raise HTTPException(413, "El archivo supera 25 MiB.")
    if zipfile.is_zipfile(io.BytesIO(data)):
        with zipfile.ZipFile(io.BytesIO(data)) as archive:
            members = archive.infolist()
            if len(members) > 10000 or sum(i.file_size for i in members) > MAX_EXPANDED_BYTES:
                raise HTTPException(413, "El archivo comprimido supera el limite de expansion.")
    return data
