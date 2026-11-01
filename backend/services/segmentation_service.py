import numpy as np
from sklearn.cluster import KMeans

def get_customer_segments(customers_data: list) -> list:
    """
    Takes a list of dicts with 'id', 'recency', 'frequency', 'monetary'
    Returns same list with added 'segment' label.
    """
    if not customers_data or len(customers_data) < 4:
        for c in customers_data:
            c['segment'] = "New"
        return customers_data

    features = np.array([[c['recency'], c['frequency'], c['monetary']] for c in customers_data])
    
    kmeans = KMeans(n_clusters=4, random_state=42, n_init=10)
    labels = kmeans.fit_predict(features)
    
    centers = kmeans.cluster_centers_
    sorted_clusters_by_monetary = np.argsort(centers[:, 2])
    
    label_map = {}
    label_map[sorted_clusters_by_monetary[3]] = "Big Spenders"
    label_map[sorted_clusters_by_monetary[2]] = "Loyal"
    label_map[sorted_clusters_by_monetary[1]] = "New"
    label_map[sorted_clusters_by_monetary[0]] = "At-Risk"
    
    for i, c in enumerate(customers_data):
        c['segment'] = label_map[labels[i]]

    return customers_data
