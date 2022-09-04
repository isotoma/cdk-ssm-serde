export interface GetProps {
    parameterPrefix: string;
    attributeParameterOverrides?: Record<string, string>;
}

export interface PutProps<A> extends GetProps {
    attributeParameterLogicalIdOverrides?: Record<string, string>;
    resource: A;
}

export const getParameter = (props: GetProps, key: string): string => {
    return `${props.parameterPrefix}/${(props.attributeParameterOverrides ?? {})[key] ?? key}`;
};

export const getParameterLogicalId = (props: PutProps<unknown>, key: string): string => {
    return (props.attributeParameterLogicalIdOverrides ?? {})[key] ?? getParameter(props, key);
};
