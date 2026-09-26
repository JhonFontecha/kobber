"""Resolve legacy image names without changing stored product data."""
import re
from urllib.parse import unquote, urlsplit


def image_variant_id(url, variants):
    try:
        filename = unquote(urlsplit(url).path.rsplit('/', 1)[-1])
    except (TypeError, ValueError):
        return None
    matches = {
        v['id'] for v in variants if v.get('id') and v.get('clave')
        and re.fullmatch(
            re.escape(v['clave']) + r'(?:\+FC\d+)?\.(?:jpg|jpeg|png|webp)',
            filename, re.IGNORECASE,
        )
    }
    return next(iter(matches)) if len(matches) == 1 else None


def galleries(images, variants):
    """Explicit associations win; only unambiguous legacy names are inferred."""
    own = {v['id']: [] for v in variants}
    general = []
    for image in sorted(images, key=lambda i: i.get('orden') or 0):
        target = image.get('variant_id') or image_variant_id(image['url'], variants)
        if target in own:
            own[target].append(image['url'])
        elif target is None:
            general.append(image['url'])
    return {key: list(dict.fromkeys(urls or general)) for key, urls in own.items()}
