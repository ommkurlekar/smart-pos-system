def recommend_products(cart_product_ids: list, all_transactions: list, all_products: list) -> list:
    """
    Simple Market Basket Analysis / Collaborative approach
    Returns top 3 recommended product dicts.
    """
    if not cart_product_ids or not all_transactions:
        return []

    co_occurrences = {}
    for tx in all_transactions:
        tx_item_ids = [item.product_id for item in tx.items]
        if any(prod_id in tx_item_ids for prod_id in cart_product_ids):
            for tx_id in tx_item_ids:
                if tx_id not in cart_product_ids:
                    co_occurrences[tx_id] = co_occurrences.get(tx_id, 0) + 1

    sorted_recs = sorted(co_occurrences.items(), key=lambda x: x[1], reverse=True)
    top_3_ids = [k for k, v in sorted_recs[:3]]
    
    recommendations = []
    for pid in top_3_ids:
        for p in all_products:
            if p.id == pid:
                recommendations.append({
                    "id": p.id,
                    "name": p.name,
                    "price": p.price,
                    "confidence": round(co_occurrences[pid] / len(all_transactions) if len(all_transactions)>0 else 0, 2)
                })
                break
                
    return recommendations
