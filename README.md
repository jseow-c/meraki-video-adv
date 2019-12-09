# Meraki Video Advertisement

Meraki Video Advertisement is a NodeJS library for showcase an example of Meraki Camera.

## Pre-requisites

Install the runtime [nodejs](https://nodejs.org/en/) to install NodeJS and Node Package Manager.

```bash
# Ubuntu
sudo apt-get install curl
curl -sL https://deb.nodesource.com/setup_12.x | sudo -E bash -
sudo apt-get install nodejs
```

Install [git](https://git-scm.com/) that is required to pull source later.

```bash
# Ubuntu
sudo apt install git
```

Ensure you have access to [github](https://www-github.cisco.com/) with [sshkey access](https://help.github.com/en/enterprise/2.16/user/authenticating-to-github/connecting-to-github-with-ssh).

## Installation

Clone the [package](https://www-github.cisco.com/jseow/meraki-video-adv) to a folder in your VM.

```bash
cd /path/to/the/folder
git clone git@www-github.cisco.com:jseow/meraki-video-adv.git
cd meraki-video-adv
```

Use the package manager [npm](https://nodejs.org/en/) to install its dependencies.

```bash
npm install
```

## Setup

### Basic Setup

Look for all example files in the root folder and clone them respectively as below.

```bash
# find all the files with example extension
ls -l | grep example
# copy them out respectively
cp credentials.json.example credentials.json
cp meraki.json.example meraki.json
```

Change your host javascript file to make sure you are pointing to your VM appropriately. You only need to change the server variable. You may find the URL of your VM by looking at the **IPv4 Public IP** in the [EC2 Console Page](https://ap-southeast-1.console.aws.amazon.com/ec2/home?region=ap-southeast-1#Instances:sort=instanceId).

```bash
# static/js/host.js
const server = "http://localhost";
const port = "3000";
const socketPort = "8118";
```

### Setup Service

Copy the service file to your systemd folder

```bash
cp meraki-video.service /etc/systemd/system/
cd /etc/systemd/system
```

Change your service file according to the folder of your node and where you place your meraki-demo folder.

> Note: You may find where is your node binary by executing **whereis node** in your VM.

```bash
# meraki-video.service
...
ExecStart=/path/to/folder/node /path/to/meraki-demo/folder/server.js
ExecReload=/path/to/folder/node /path/to/meraki-demo/folder/server.js
WorkingDirectory=/path/to/meraki-demo/folder
...
```

Restart your System Daemon to load the changes in the your System Daemon.

```bash
sudo systemctl daemon-reload
```

### Setup Credentials

If you already have an access key with **AmazonRekognitionFullAccess**, you may skip the following 8 steps.

1. Login to AWS and proceed to [IAM](https://console.aws.amazon.com/iam/home?#/home).
2. On the left-hand side navigation, click on Access Management > Users
3. Click on the the button named "Add User"
4. Type in a username and select "Programmatic access" and proceed Next.
5. Click on "Create group" with "AmazonRekognitionFullAccess" and proceed Next.
6. Click next until you create the user.
7. Click on the newly created user and proceed to "Security Credentials" tab.
8. Create an access key and remember your **accessKey** and **secretAccessKey** and **region**.

Replace the **Credentials** content.

```bash
# credentials.json
{
  "accessKeyId": "accessKey",
  "secretAccessKey": "secretAccessKey",
  "region": "ap-southeast-1"
}
```

### Setup Meraki

Replace Meraki content accordingly.

```bash
# meraki.json
{
  "apiKey": "meraki-api-key",
  "networkID": "meraki-network-id",
  "camSerial": "meraki-camera-serial"
}
```

## Usage

Start the Service

```bash
sudo systemctl start meraki-video
```

You should be able to see your URL by accessing your VM.

> If you find that you cannot access the service, you might want to check out the [Security Group](https://ap-southeast-1.console.aws.amazon.com/ec2/home?region=ap-southeast-1#SecurityGroups:sort=groupId) settings of your VM to ensure that port 3000 is allowed for in-bound traffic.

## Contributing

Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

Please make sure to update tests as appropriate.

## License

[MIT](https://choosealicense.com/licenses/mit/)
