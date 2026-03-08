import { useState, useEffect } from 'react';

const globalCache = new Map<string, any>();
const inflightPromises = new Map<string, Promise<any>>();

/**
 * Hook customizado para Caching em memória (Padrão SWR - Stale-While-Revalidate).
 * Evita telas de Loading (Spinners/Skeletons) repetitivas quando o usuário troca de abas,
 * exibindo o cache instantaneamente enquanto re-busca dados silenciosamente no fundo.
 * Adicionalmente: Deduplica Promises (Picos de requisições simultâneas para o mesmo key).
 */
export function useCachedData<T>(
    key: string,
    fetcher: () => Promise<{ success: boolean; data?: T }>,
    dependencies: any[]
) {
    // Busca síncrona direta: se o novo mês já está no Map, será lido no próprio Render Tick (Zero Delay).
    const cachedItem = globalCache.get(key) as T | undefined;

    // Fallback de estado local para quando o fetch resolver e o componente precisar repintar.
    const [fetchedData, setFetchedData] = useState<T | null>(null);
    const [isFetching, setIsFetching] = useState(false);

    // Se temos os dados no mapa (cachedItem), loading = false. Caso contrário, se estamos buscando = true.
    const loading = !cachedItem && isFetching;

    // O Dado final é SEMPRE o Cache primeiro. Se o cache existir, ele engole o fetchedData.
    // Assim que a key muda, se for virgem, cachedItem é undef, passa pro fetchedData que é null -> Mostra Skeleton.
    const currentData = cachedItem !== undefined ? cachedItem : fetchedData;

    useEffect(() => {
        let isMounted = true;

        async function load() {
            if (!globalCache.has(key)) setIsFetching(true);

            try {
                // Deduplicação
                let promise = inflightPromises.get(key);
                if (!promise) {
                    promise = fetcher();
                    inflightPromises.set(key, promise);
                }

                const res = await promise;

                if (isMounted && res.success && res.data) {
                    globalCache.set(key, res.data);
                    setFetchedData(res.data);
                }
            } catch (error) {
                console.error("Cache fetch error for key", key, error);
            } finally {
                // Ao terminar, remove da lista de voo.
                if (inflightPromises.get(key)) inflightPromises.delete(key);
                if (isMounted) setIsFetching(false);
            }
        }

        load();

        return () => {
            isMounted = false;
        };
        // A própria prop `key` é imperativa como trigger.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [key, ...dependencies]);

    return {
        data: currentData || null,
        loading: !cachedItem
    };
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
