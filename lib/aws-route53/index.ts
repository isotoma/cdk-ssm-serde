import * as constructs from 'constructs';
import * as route53 from 'aws-cdk-lib/aws-route53';
import * as ssm from 'aws-cdk-lib/aws-ssm';
import { GetProps, PutProps, getParameter, getParameterLogicalId } from '../shared';

export class HostedZone {
    static fromSsm(scope: constructs.Construct, id: string, props: GetProps): route53.IHostedZone {
        return route53.HostedZone.fromHostedZoneAttributes(scope, id, {
            hostedZoneId: ssm.StringParameter.valueForStringParameter(scope, getParameter(props, 'hostedZoneId')),
            zoneName: ssm.StringParameter.valueForStringParameter(scope, getParameter(props, 'zoneName')),
        });
    }

    static toSsm(scope: constructs.Construct, props: PutProps<route53.IHostedZone>): void {
        new ssm.StringParameter(scope, getParameterLogicalId(props, 'hostedZoneId'), {
            parameterName: getParameter(props, 'hostedZoneId'),
            stringValue: props.resource.hostedZoneId,
        });
        new ssm.StringParameter(scope, getParameterLogicalId(props, 'zoneName'), {
            parameterName: getParameter(props, 'zoneName'),
            stringValue: props.resource.zoneName,
        });
    }
}
