import * as constructs from 'constructs';
import { IHostedZone, HostedZone } from 'aws-cdk-lib/aws-route53';
import * as eks from 'aws-cdk-lib/aws-eks';
import * as ssm from 'aws-cdk-lib/aws-ssm';

interface GetProps {
    parameterPrefix: string;
    attributeParameterOverrides?: Record<string, string>;
}

interface PutProps<A> extends GetProps {
    attributeParameterLogicalIdOverrides?: Record<string, string>;
    resource: A;
}

const getParameter = (props: GetProps, key: string): string => {
    return `${props.parameterPrefix}/${(props.attributeParameterOverrides ?? {})[key] ?? key}`;
};

const getParameterLogicalId = (props: PutProps<unknown>, key: string): string => {
    return (props.attributeParameterLogicalIdOverrides ?? {})[key] ?? getParameter(props, key);
};

// Resources

export const getHostedZone = (scope: constructs.Construct, id: string, props: GetProps): IHostedZone => {
    return HostedZone.fromHostedZoneAttributes(scope, id, {
        hostedZoneId: ssm.StringParameter.valueForStringParameter(scope, getParameter(props, 'hostedZoneId')),
        zoneName: ssm.StringParameter.valueForStringParameter(scope, getParameter(props, 'zoneName')),
    });
};

export const putHostedZone = (scope: constructs.Construct, props: PutProps<IHostedZone>): void => {
    new ssm.StringParameter(scope, getParameterLogicalId(props, 'hostedZoneId'), {
        parameterName: getParameter(props, 'hostedZoneId'),
        stringValue: props.resource.hostedZoneId,
    });
    new ssm.StringParameter(scope, getParameterLogicalId(props, 'zoneName'), {
        parameterName: getParameter(props, 'zoneName'),
        stringValue: props.resource.zoneName,
    });
};

export interface GetEksClusterProps extends GetProps {
    connectProviderLookupLogicalId?: string;
}

export const getEksCluster = (scope: constructs.Construct, id: string, props: GetEksClusterProps): eks.ICluster => {
    return eks.Cluster.fromClusterAttributes(scope, id, {
        clusterName: ssm.StringParameter.valueForStringParameter(scope, getParameter(props, 'clusterName')),
        kubectlRoleArn: ssm.StringParameter.valueForStringParameter(scope, getParameter(props, 'kubectlRoleArn')),
        openIdConnectProvider: eks.OpenIdConnectProvider.fromOpenIdConnectProviderArn(
            scope,
            props.connectProviderLookupLogicalId ?? `${id}ConnectProvider`,
            ssm.StringParameter.valueForStringParameter(scope, getParameter(props, 'openIdConnectProviderArn')),
        ),
    });
};

export const putEksCluster = (scope: constructs.Construct, props: PutProps<eks.ICluster>): void => {
    new ssm.StringParameter(scope, getParameterLogicalId(props, 'clusterName'), {
        parameterName: getParameter(props, 'clusterName'),
        stringValue: props.resource.clusterName,
    });
    new ssm.StringParameter(scope, getParameterLogicalId(props, 'kubectlRoleArn'), {
        parameterName: getParameter(props, 'kubectlRoleArn'),
        stringValue: props.resource.kubectlRole?.roleArn ?? '',
    });
    new ssm.StringParameter(scope, getParameterLogicalId(props, 'openIdConnectProviderArn'), {
        parameterName: getParameter(props, 'openIdConnectProviderArn'),
        stringValue: props.resource.openIdConnectProvider.openIdConnectProviderArn ?? '',
    });
};
