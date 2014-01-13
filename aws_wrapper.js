/**
 * Created by ejf3 on 11/20/13.
 */

var AWS = require('aws-sdk');

/**
 * Don't hard-code your credentials!
 * Export the following environment variables instead:
 *
 * export AWS_ACCESS_KEY_ID='AKID'
 * export AWS_SECRET_ACCESS_KEY='SECRET'
 * export AWS_RDS_HOST='hostname'
 * export AWS_RDS_MYSQL_USERNAME='username'
 * export AWS_RDS_MYSQL_PASSWORD='pass'
 */
AWS.config.region = "us-east-1";
AWS.config.apiVersions = {
    s3: '2006-03-01',
    rds: '2013-09-09',
    dynamodb: '2012-08-10',
    ses: '2010-12-01'
};

var dynamoUsers = require('./dynamo-demo/users.js')
    , dynamoMedia = require('./dynamo-demo/media.js')
    , dynamoEmail = require('./dynamo-demo/email.js')
    , rdsUsers = require('./rds-demo/users.js')
    , rdsMedia = require('./rds-demo/media.js')
    , S3Utils = require('./s3-demo/s3_utils.js')
    , userActivity = require('./ses-demo/user_activity.js')
    ;

if (process === undefined) {
    console.error('no process found');
    return;
}

var mysqlHost = process.env['AWS_RDS_HOST'];
var mysqlUserName = process.env['AWS_RDS_MYSQL_USERNAME'];
var mysqlPassword = process.env['AWS_RDS_MYSQL_PASSWORD'];
if (!mysqlHost || !mysqlPassword || !mysqlUserName) {
    console.error('no process found');
    return;
}
var rds_conf = {
    host: mysqlHost,
    database: "aws_node_demo",
    user: mysqlUserName,
    password: mysqlPassword
};

function AwsWrapper () {
    // Dynamo
    this.dynamodb = new AWS.DynamoDB();
    this.DynamoUsers = new dynamoUsers(this.dynamodb);
    this.DynamoMedia = new dynamoMedia(this.dynamodb);
    this.DynamoEmail = new dynamoEmail(this.dynamodb);
    console.log('init dynamo wrappers');

    // RDS
    this.rds = new AWS.RDS();
    this.RdsUsers = new rdsUsers(this.rds, rds_conf);
    this.RdsMedia = new rdsMedia(this.rds, rds_conf);
    console.log('init rds wrappers');

    // S3
    this.s3 = new AWS.S3();
    this.S3Utils = new S3Utils(this.s3);
    console.log('init s3 wrapper');

    // SES
    this.ses = new AWS.SES();
    this.SesUserActivity = new userActivity(this.ses, this.DynamoMedia, this.DynamoEmail);
};

module.exports = AwsWrapper;