"""Cliente mínimo con la misma forma que el query builder de Supabase.

Lo usan los tests y el modo local KOBBER_DEV_FIXTURES=1. No reemplaza a
Supabase en producción.
"""
from __future__ import annotations

from datetime import datetime, timezone
from typing import Any


class _Result:
    def __init__(self, data):
        self.data = data


class MemoryQuery:
    def __init__(self, store: "MemoryStore", table: str):
        self.store = store
        self.table = table
        self.filters: list[tuple] = []
        self.limit_n: int | None = None
        self.order_key: str | None = None
        self.order_desc = False
        self.op = "select"
        self.payload: Any = None
        self.columns = ""

    def select(self, columns="*", *args, **kwargs):
        self.columns = columns or ""
        if (
            self.table == "product_variants"
            and "precio_anterior" in self.columns
            and not self.store.offers_column
        ):
            raise RuntimeError("column product_variants.precio_anterior does not exist")
        return self

    def eq(self, key, value):
        self.filters.append(("eq", key, value))
        return self

    def neq(self, key, value):
        self.filters.append(("neq", key, value))
        return self

    def in_(self, key, values):
        self.filters.append(("in", key, set(values)))
        return self

    def order(self, key, desc=False):
        self.order_key = key
        self.order_desc = desc
        return self

    def limit(self, n):
        self.limit_n = n
        return self

    def insert(self, payload):
        self.op = "insert"
        self.payload = payload
        return self

    def execute(self):
        rows = self.store.tables.setdefault(self.table, [])
        if self.op == "insert":
            payloads = self.payload if isinstance(self.payload, list) else [self.payload]
            created = []
            for raw in payloads:
                row = dict(raw)
                if "id" not in row:
                    row["id"] = self.store.next_id(self.table)
                if self.table == "orders" and "created_at" not in row:
                    row["created_at"] = datetime.now(timezone.utc).isoformat()
                rows.append(row)
                created.append(row)
            return _Result(created)

        matched = [row for row in rows if self._match(row)]
        if self.order_key:
            matched.sort(key=lambda row: (row.get(self.order_key) is None, row.get(self.order_key) or ""), reverse=self.order_desc)
        if self.limit_n is not None:
            matched = matched[: self.limit_n]
        return _Result(matched)

    def _match(self, row: dict) -> bool:
        for op, key, value in self.filters:
            current = row.get(key)
            if op == "eq" and current != value:
                return False
            if op == "neq" and current == value:
                return False
            if op == "in" and current not in value:
                return False
        return True


class MemoryStore:
    def __init__(self, offers_column: bool = True):
        self.tables: dict[str, list] = {}
        self.offers_column = offers_column
        self._seq = 0

    def table(self, name: str) -> MemoryQuery:
        return MemoryQuery(self, name)

    def next_id(self, table: str):
        self._seq += 1
        if table == "orders":
            return self._seq
        return f"{table}-{self._seq}"
