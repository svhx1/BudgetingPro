import { useState, useEffect } from 'react';

const globalCache = new Map<string, any>();

/**
 * Hook customizado para Caching em memória (Padrão SWR - Stale-While-Revalidate).
 * Evita telas de Loading (Spinners/Skeletons) repetitivas quando o usuário troca de abas,
 * exibindo o cache instantaneamente enquanto re-busca dados silenciosamente no fundo.
 */
export function useCachedData<T>(
    key: string,
    fetcher: () => Promise<{ success: boolean; data?: T }>,
    dependencies: any[]
) {
    const [data, setData] = useState<T | null>(globalCache.get(key) || null);
    // Só mostramos tela de loading forte se NÃO houver nada em cache.
    const [loading, setLoading] = useState(!globalCache.has(key));

    useEffect(() => {
        let isMounted = true;

        async function load() {
            if (!globalCache.has(key)) {
                setLoading(true);
            }

            try {
                const res = await fetcher();
                if (isMounted && res.success && res.data) {
                    globalCache.set(key, res.data);
                    setData(res.data);
                }
            } catch (error) {
                console.error("Cache fetch error:", error);
            } finally {
                if (isMounted) setLoading(false);
            }
        }

        load();

        return () => {
            isMounted = false;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, dependencies);

    return { data, loading };
}

export function clearCache(prefix?: string) {
    if (prefix) {
        for (const key of globalCache.keys()) {
            if (key.startsWith(prefix)) globalCache.delete(key);
        }
    } else {
        globalCache.clear();
    }
}
