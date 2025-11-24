import httpx
from typing import AsyncIterator, Dict, Any, Iterable

class AdmitadClient:
    def __init__(self, client_id: str, client_secret: str, token: str):
        self.client_id = client_id
        self.client_secret = client_secret
        self.token = token
        self.base = "https://api.admitad.com"

    async def fetch_transactions(self) -> AsyncIterator[Dict[str, Any]]:
        url = f"{self.base}/v2/statistics/actions/"
        headers = {"Authorization": f"Bearer {self.token}"}
        async with httpx.AsyncClient(timeout=30) as client:
            r = await client.get(url, headers=headers)
            if r.status_code != 200:
                return
            data = r.json()
            for row in data.get("results", []):
                yield {
                    "external_id": str(row.get("action_id")),
                    "status": row.get("status"),
                    "amount": float(row.get("payment" ,0) or 0),
                    "merchant_ext_id": str(row.get("advertiser_id")),
                    "click_ext_id": str(row.get("click_id")),
                }

class VCommissionClient:
    def __init__(self, api_key: str):
        self.api_key = api_key
        self.base = "https://track.vcommission.com/api"

    async def fetch_transactions(self) -> AsyncIterator[Dict[str, Any]]:
        url = f"{self.base}/v2/transactions"
        params = {"apiKey": self.api_key}
        async with httpx.AsyncClient(timeout=30) as client:
            r = await client.get(url, params=params)
            if r.status_code != 200:
                return
            data = r.json()
            for row in data.get("transactions", []):
                yield {
                    "external_id": str(row.get("transaction_id")),
                    "status": row.get("status"),
                    "amount": float(row.get("commission" ,0) or 0),
                    "merchant_ext_id": str(row.get("merchant_id")),
                    "click_ext_id": str(row.get("click_id")),
                }

class CueLinksClient:
    def __init__(self, api_key: str):
        self.api_key = api_key
        self.base = "https://api.cuelinks.com"

    async def fetch_transactions(self) -> AsyncIterator[Dict[str, Any]]:
        url = f"{self.base}/v2/transactions"
        headers = {"X-Api-Key": self.api_key}
        async with httpx.AsyncClient(timeout=30) as client:
            r = await client.get(url, headers=headers)
            if r.status_code != 200:
                return
            data = r.json()
            for row in data.get("transactions", []):
                yield {
                    "external_id": str(row.get("id")),
                    "status": row.get("status"),
                    "amount": float(row.get("commission" ,0) or 0),
                    "merchant_ext_id": str(row.get("merchant_id")),
                    "click_ext_id": str(row.get("click_id")),
                }

async def merge_transactions(*sources: Iterable[AsyncIterator[Dict[str, Any]]]):
    for source in sources:
        async for tx in source:  # sources are async generators
            yield tx
