# Hirepool Web Application \#splash

Hirepool is a web application built with Ruby on Rails, Angular.js, and Foundation.

Hirepool includes a tool for job seekers to track their job search and admin functionality for career coaches to support job seekers.

## Getting Started

#### Prerequisites

###### Install Xcode
Xcode is required to build additional software. It includes command line tools, including the Apple LLVM compiler and `make`.

Visit (https://developer.apple.com/xcode/) to download Xcode. (Or install via the App Store)

_Note:_ Xcode is a pre-requisite for Homebrew.

###### Install Homebrew
We use `homebrew` to manage and install libraries and packages on macOS. Paste the following into your terminal, and follow the instructions:

```sh
$ /usr/bin/ruby -e "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/master/install)"
```

Visit (https://brew.sh/) for more info and additional installation options.

Use `homebrew` to install some core dependencies:

```sh
brew install libxml2 libxslt openssl zlib curl git tree vim wget
```

###### Install Homebrew Services (Optional)
_NOTE:_ This step is optional, but recommended.

Homebrew Services integrates Homebrew formulae with macOS's `launchctl` manager.

```sh
$ brew tap homebrew/services
```

To list all services managed by `brew services`:

```sh
$ brew services list
```

See (https://github.com/Homebrew/homebrew-services) for additional info.

###### Install MySQL

The app uses MySQL as a database backend.

```sh
$ brew update
$ brew install mysql
```

Set mysql to autostart:

```sh
$ brew services start mysql
```

###### Install `nvm` and `node.js`
Use `homebrew` to install `nvm`:

```sh
$ brew update
$ brew install nvm
$ mkdir -p $HOME/.nvm
```

Add the following to your `.profile`, `.bash-profile` or `.zshrc` file:

```sh
export NVM_DIR="$HOME/.nvm"
[ -s "$(brew --prefix nvm)/nvm.sh" ] && . "$(brew --prefix nvm)/nvm.sh" # This loads nvm
nvm use default > /dev/null
```

Restart your terminal to complete the `nvm` installation, and verify it with:

```sh
$ command -v nvm
```

It should output `'nvm'` if the installation was successful. Please note that `which nvm` will not work, since `nvm` is a sourced shell function, not an executable binary.

Use `nvm` to install `node` and `npm`:

```sh
$ nvm install 5.1.0
$ nvm alias default 5.1.0
```

Use `npm` to install `bower` globally:

```sh
$ npm install -g bower
```

###### Install `rbenv` and `ruby`

We use `rbenv` to manage various versions of `ruby`.

```sh
$ brew update
$ brew install rbenv rbenv-default-gems
```
_NOTE:_ the `rbenv` homebrew formula also installs ruby-build, so you'll be ready to install other Ruby versions out of the box.

Once `rbenv` is installed, it must be integrated with your shell. Run the `rbenv init`, and follow the instructions provided to integrate with your shell.

In most cases, you will need to add some variation of `eval "$(rbenv init -)"` to your `.bashrc`, `.bash-profile`, or `.zshrc`.  This step will shim `ruby` to the version managed by `rbenv`.

Restart your terminal to complete the `rbenv` setup. Remember to `cd` back into directory you cloned the `hirepool` repo to.

See the [`rbenv` Github repo](https://github.com/rbenv/rbenv) and [Installing with Homebrew on macOS](https://github.com/rbenv/rbenv#homebrew-on-macos) for more details.

`rbenv-default-gems` automatically installs the gems listed in the `$(rbenv root)/default-gems` file every time you successfully install a new version of Ruby with rbenv install. Create a `default-gems` file, and add `bundler` and `compass` to it:

```sh
$ touch $(rbenv root)/default-gems
$ echo 'bundler' >> $(rbenv root)/default-gems
$ echo 'compass' >> $(rbenv root)/default-gems
```

Optionally, add some additional ruby requirements and niceties to be automatically installed when you build any version of `ruby`:

```sh
$ echo 'nokogiri' >> $(rbenv root)/default-gems
$ echo 'rails' >> $(rbenv root)/default-gems
$ echo 'pry' >> $(rbenv root)/default-gems
$ echo 'awesome_print' >> $(rbenv root)/default-gems
$ echo 'byebug' >> $(rbenv root)/default-gems
$ echo 'hirb' >> $(rbenv root)/default-gems
$ echo 'wirble' >> $(rbenv root)/default-gems
```

For more info, see [`rbenv-default-gems` Github repo](https://github.com/rbenv/rbenv-default-gems).

_Tip:_ For faster gem installation, tell `rubygems` to skip installing `ri` or `rdoc` documentation:

```sh
$ touch ~/.gemrc
$ echo 'gem: --no-ri --no-rdoc' >> ~/.gemrc
```

Next, use `rbenv` to install `ruby`:

```sh
$ rbenv install 2.2.3
```

This will take some time, so go get a cup of coffee, or other beverage of choice.

After installing `ruby`, run `command -v ruby` or `command -v gem`. The output should point to the `.rbenv/shims` directory in your user's home directory.

E.g. (where `${HOME}` is your user's home directory, e.g. `/Users/Tom`):

```sh
$ command -v ruby
${HOME}/.rbenv/shims/ruby
```

```sh
$ command -v gem
${HOME}/.rbenv/shims/gem
```

If `ruby` or `gem` points elsewhere (like `/usr/bin`), then your shell is still using the system ruby version, instead of the `ruby` we just installed with `rbenv`. Start process over again or start troubleshooting and see where you went wrong.

There is a [`rbenv-doctor`](https://github.com/rbenv/rbenv-installer/blob/master/bin/rbenv-doctor) script hosted on [`rbenv` Github repo](https://github.com/rbenv/rbenv), which may be of help. Visit [`rbenv` github](https://github.com/rbenv/rbenv) for more info on debugging.

Once you have verified that `ruby` is installed successfully, continue on.


### Configure and Run the Application

###### Clone the repo

Use `git clone` to grab a copy of this repo, and cd into the root directory of the repo (`hirepool` in most cases):

```sh
$ git clone https://github.com/hirepool/hirepool.git
$ cd hirepool
```

###### Set `ruby` for the Application
From inside the application root directory, use `rbenv` to set a local version of `ruby`:

```sh
$ rbenv local 2.2.3
```

###### Install Gems

If you did _not_ add `rbenv-default-gems` above, you must now install the `bundler` and `compass` gems. Otherwise, skip to the next section.

```sh
$ gem install bundler
$ gem install compass
```

Next user `bundler` to install the rest of the dependencies from the `Gemfile`:

```sh
$ bundle install
```

###### Set up the Application Database

If you skipped the step of setting `mysql` to autostart via `brew services`, you should manually start up the db server now:

```sh
$ mysqld &
```

Use `rake` to create the database and run `rails` migrations:

```sh
$ bundle exec rake db:create
$ bundle exec rake db:migrate
$ bundle exec rake db:seed
```

###### Setting up the Application Client (Front-end)

The front-end application code lives in the `client` directory in the root of the repository:

```sh
$ cd client
```

Use `npm` and `bower` to install the javascript dependencies

```sh
$ npm install
$ bower install
```

_Note:_ `npm` and `bower` were installed when you [installed `nvm`](#install-nvm-and-node-js). If you run into trouble, double check your `nvm` installation.

### Configuring environment variables

Copy the contents of `.env.example` into a new file in the root project folder named `.env`. The instructions for setting environment variables for you local environment can be found in the wiki here: https://github.com/hirepool/hirepool/wiki/Environment-Variables


### Launch instructions

In the `root` dir of the project, run:

```sh
$ rails s
```

Make sure you have grunt installed (`npm install -g grunt-cli`), and then, in the `client` dir of the project, run:

```sh
$ grunt serve
```

This will start a grunt server on `localhost:9000` that will proxy calls to Rails' `localhost:3000`.

To build the prod front-end environment:

```sh
$ grunt build --force
```
If, at this point, you get the error `Proxy error: ECONNREFUSED`, go back and re-start rails as `rails s -b 0.0.0.0`.

### Deploying to AWS

###### Create IAM Credentials (Preliminary)

Connect to the AWS Management console in a browser and navigate to `IAM` > `Users` and select your User. From your user's Summary page, select the `Security Credentials` tab and under the `Access keys` section, click `Create access key`.  This will generate a new `aws_access_key_id` and `aws_secret_access_key`.

Make note of both these keys, but especially the `secret` key, as you will not be able to see it once you dismiss the dialog.  You will need to add both of these keys to the `credentials` file that you create in the next step.

_Note:_ You may have up to two sets of credentials at a time.  As a best practice, AWS recommends frequent key rotation.

###### Install `aws-cli` and `awsebcli`

Deploys are facilitated via Elastic Beanstalk.  The Elastic Beanstalk CLI is a collection python scripts that wraps the `aws-cli`; you must install and configure the `aws-cli` before you can use `eb-cli`.

Use `homebrew` to install `aws-cli`:

```sh
$ brew install awscli
```

Create the `.aws` directory in your user's $HOME folder:

```sh
$ mkdir -p $HOME/.aws
```

Change directories into the `.aws` you just created, and add two files named `config` and `credentials`:

```sh
$ cd $HOME/.aws
$ touch config
$ touch credentials
```

Open `$HOME/.aws/config` in your editor of choice, and add the following:

```ini
[default]
output = json

[hirepool]
source-profile = default
region = us-west-2
```

Open `$HOME/.aws/credentials` in your editor of choice, and add the following:

```ini
[default]
aws_access_key_id = <ACCESS-KEY-ID FROM IAM>
aws_secret_access_key = <SECRET-ACCESS-KEY FROM IAM>

[hirepool]
aws_access_key_id = <ACCESS-KEY-ID FROM IAM>
aws_secret_access_key = <SECRET-ACCESS-KEY FROM IAM>
```

This should set up `aws-cli` for use. You can verify the setup by using the `aws` CLI. For example, try and fetch your user with the CLI:

```sh
$ aws iam get-user
```

Should respond with the following JSON:

```json
{
    "User": {
        "Path": "/",
        "UserName": "evan",
        "UserId": "ABC....XYZ",
        "Arn": "arn:aws:iam::123456...7890:user/evan",
        "CreateDate": "2017-10-17T19:09:23Z",
        "PasswordLastUsed": "2018-03-06T23:52:17Z"
    }
}
```

Next, install the `awsebcli` via `homebrew`:

```sh
$ brew install awsebcli
```

Then create your `.elasticbeanstalk/config.yml` for the `eb-cli` from your `hirepool` repository root:

```sh
$ eb init hirepool --profile hirepool --region us-west-2
```

You will be prompted for some additional config options, and the defaults should suffice, but just in case:

```
Default Environment: hirepool-prod-blue
Continue with CodeCommit: N
```

###### Setting an Elastic Beanstalk Environment
By default you should specify the environment name when using the `eb` cli tool, e.g. `eb logs hirepool-staging`.

To configure a branch to use a specific environment by default, use the `eb use <environment_name>` command. For example, given a branch called `feature_abc`:

```sh
$ eb use hirepool-staging
```

Will add the following entry to your `.elasticbeanstalk/config.yml`:

```yaml
branch-defaults:
  feature_abc:
    environment: hirepool-staging
```

Or to make `hirepool-staging` the default environment for the `master` branch:

```sh
$ git checkout master
$ eb use hirepool-staging
```

###### Deploying to Different Environments
Before you can deploy, you should make sure your current working branch is clean, i.e. there are no modified, pending, or untracked file. You can either commit and changes you have, or stash them with `git stash`.  While the deploy script checks for uncommitted changes, as of writing, it does not ensure that untracked files are committed or removed.

**_Warning:_ untracked files _will_ be deployed!**

To deploy to `prod`, use:

```sh
$ ./deploy.sh prod
```

To deploy to `staging`, use:

```sh
$ ./deploy.sh staging
```

The `deploy.sh` script creates a deploy commit as part of the script, so if you deploy to staging, and want to make changes to your branch, you should roll back the deploy commit first.

The following will remove the last commit made on the branch.
**_Warning:_ this git command is destructive! It is a good idea to check the commit logs with `git log` _first_ and explicitly looking up the commit hash to reset:**

```sh
$ git log
$ git reset --hard <COMMIT-HASH-BEFORE-DEPLOY>
```

###### Connecting to a Deployed Instance With SSH

Generate a new SSH key with `ssh-keygen`.

```sh
$ ssh-keygen \
  -t rsa -b 4096 \
  -C "evan@hirepool.io" \
  -f "$HOME/.ssh/aws/evan_at_hirepool_dot_io" \
  -N ""
```

Upload the new **public** key to your AWS IAM user profile. You can either use the AWS Management Console in a browser, or use the `aws-cli`:

```sh
$ aws iam \
  upload-ssh-public-key \
  --user-name=evan \
  --ssh-public-key-body="$(cat $HOME/.ssh/aws/evan_at_hirepool_io.pub)"
```

At this point, either: rebuild the environment, redeploy the application, or have an already authorized user manually run the SSH Public key update script on the instance. _Note:_ the first two aforementioned options will automatically run the update script.

To SSH into the instance and manually ran the update script:

```sh
$ eb ssh hirepool-staging
  . . .
  . . .
  . . .
 [ec2-user@ip-172-31-4-122 ~]$ /opt/elasticbeanstalk/support/scripts/iam_user_ssh_publickeys.sh
```

Once the IAM user public keys have been added to the `.ssh/authorized_keys` file on the EC2 instance, you should have SSH access to the instance.

To connect with your custom SSH key, specify the private key for use with `eb ssh` via the `--custom` option, and connect successfully:

```sh
$ eb ssh hirepool-staging \
  --custom="ssh -i $HOME/.ssh/aws/evan_at_hirepool_dot_io"
```

_Tip:_ as a shortcut, create a symlink in the `$HOME/.ssh` directory from the actual private key, to a file called `aws-eb` (this is the default for the eb environment, as specified in the `.elasticbeanstalk/saved_configs/base.cfg.yml`):

```sh
$ cd $HOME/.ssh
$ ln -sf aws/evan_at_hirepool_dot_io aws-eb
```

Now you can connect via SSH without needing to specify the custom key every time:

```sh
$ eb ssh
```


### Running Tests

To run the ruby spec suite using `rspec`:

```sh
$ rake spec
```


### Code Quality Analysis

RuboCop is configured as a code linter for Ruby. To run RuboCop, simply use:

```sh
$ rake rubocop
```

Take a look in the `.rubocop_todo.yml` located in the project root for more info.

## Origins

Hirepool came out of the startup hirepool.io.

Contributors to this project at hirepool.io included Alison Bellach, Brady Sammons, Colin Zhu, Erin Wilson, Paulius Dragunas, and Tom Fitch.
