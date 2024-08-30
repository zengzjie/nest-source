
enum EnhancerSubtype {
    __guards__ = "guard",
    __interceptors__ = "interceptor",
    __pipes__ = "pipe",
    __exceptionFilters__ = "filter"
}

export const APP_INTERCEPTOR = "APP_INTERCEPTOR";
export const APP_PIPE = "APP_PIPE";
export const APP_GUARD = "APP_GUARD";
export const APP_FILTER = "APP_FILTER";

export const ENHANCER_TOKEN_TO_SUBTYPE_MAP: Record<typeof APP_GUARD | typeof APP_PIPE | typeof APP_FILTER | typeof APP_INTERCEPTOR, `${EnhancerSubtype}`> = {
    APP_GUARD: 'guard',
    APP_INTERCEPTOR: 'interceptor',
    APP_PIPE: 'pipe',
    APP_FILTER: 'filter'
}
