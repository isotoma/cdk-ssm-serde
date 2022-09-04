import * as constructs from 'constructs';
import * as eks from 'aws-cdk-lib/aws-eks';
import * as ssm from 'aws-cdk-lib/aws-ssm';
import { GetProps, PutProps, getParameter, getParameterLogicalId } from '../shared';

export interface GetEksClusterProps extends GetProps {
    connectProviderLookupLogicalId?: string;
}

export class Cluster {
    static fromSsm(scope: constructs.Construct, id: string, props: GetEksClusterProps): eks.ICluster {
        return eks.Cluster.fromClusterAttributes(scope, id, {
            clusterName: ssm.StringParameter.valueForStringParameter(scope, getParameter(props, 'clusterName')),
            kubectlRoleArn: ssm.StringParameter.valueForStringParameter(scope, getParameter(props, 'kubectlRoleArn')),
            openIdConnectProvider: eks.OpenIdConnectProvider.fromOpenIdConnectProviderArn(
                scope,
                props.connectProviderLookupLogicalId ?? `${id}ConnectProvider`,
                ssm.StringParameter.valueForStringParameter(scope, getParameter(props, 'openIdConnectProviderArn')),
            ),
        });
    }

    static toSsm(scope: constructs.Construct, props: PutProps<eks.ICluster>): void {
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
    }
}
