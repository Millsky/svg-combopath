@Library('acadiaBuildTools@develop') _
import com.vibrenthealth.jenkinsLibrary.VibrentConstants
def urlBranch
def workspace
def branch
def branchType
def baseVersion
def version
def pullRequest
def label = "worker-${UUID.randomUUID().toString()}"
def pullSecrets = ['reg.vibrenthealth.com', 'dockergroup.vibrenthealth.com']
def npmregistry = "https://nex.vibrenthealth.com/repository/npm"
def vibrentregistry = "https://nex.vibrenthealth.com/repository/vibrent-npm"
def packageJSON
def packageVersion
podTemplate(
    cloud:'default', label:label, imagePullSecrets: pullSecrets, containers:[
    containerTemplate(name:'sonar-scanner', image:'dockergroup.vibrenthealth.com/newtmitch/sonar-scanner', command:'cat', ttyEnabled:true),
    containerTemplate(name:'python', image:'dockergroup.vibrenthealth.com/vibrent/python27', command: 'cat', ttyEnabled:true),
            containerTemplate(name:'node', image:'alekzonder/puppeteer', command:'cat', ttyEnabled:true),
    ],idleTimeout: 30
) {
    node (label) {
        workspace = pwd()
        branch = env.BRANCH_NAME.replaceAll(/\//, "-")
        branchType = env.BRANCH_NAME.split(/\//)[0]
        urlBranch = env.BRANCH_NAME.replaceAll(/\//, "%252F")
        baseVersion = "${env.BUILD_NUMBER}"
        version = "$branch-$baseVersion"
        env.PROJECT = "svg-combopath"
        if (branch == 'develop' || branchType == 'release') {
            env.BRANCH_BUILD = "$branch-$baseVersion"
        }
        def branchCheckout
        pullRequest = env.CHANGE_ID
        if (pullRequest) {
            branchCheckout = "pr/${pullRequest}"
            refspecs = '+refs/pull/*/head:refs/remotes/origin/pr/*'
        }
        else {
            branchCheckout = env.BRANCH_NAME
            refspecs = '+refs/heads/*:refs/remotes/origin/*'
        }
        env.BRANCH = "$branch"


        ciPipeline(
            project:env.PROJECT,
            checkout: {
                stage('Checkout'){
                    checkout([
                        $class: 'GitSCM',
                        branches: [[name: "*/${branchCheckout}"]],
                        doGenerateSubmoduleConfigurations: false,
                        extensions: [[
                            $class: 'SubmoduleOption',
                            disableSubmodules  : false,
                            parentCredentials  : true,
                            recursiveSubmodules: true,
                            reference          : '',
                            trackingSubmodules : true
                        ]],
                        submoduleCfg: [],
                        userRemoteConfigs: [[
                            credentialsId: 'e08f3fab-ba06-459b-bebb-5d7df5f683a3',
                            url: 'git@github.com:VibrentHealth/svg-combopath',
                            refspec: "${refspecs}"
                        ]]
                    ])
                }
            },
            build:{
                container('node') {
                    withCredentials([usernamePassword(credentialsId: VibrentConstants.NEXUS_CREDENTIALS_ID, passwordVariable: 'PASS', usernameVariable: 'USER')]) {
                        sh """
                            cd ${workspace}
                            npm install --registry ${npmregistry}
                            node index.js
                        """
                    }
                }
            },
            sonar: {
                runSonarAnalysis (project: env.PROJECT, tool: 'scanner', sonarBranch: env.BRANCH_NAME, projectVersion: version, sonarReportPaths: 'coverage/lcov.info')
            },
            deploy: {
                container('node') {
                    if (branch == 'develop' || branchType == 'release') {
                        stage('publish to npm') {
                            withCredentials([usernamePassword(credentialsId: VibrentConstants.NEXUS_CREDENTIALS_ID, passwordVariable: 'PASS', usernameVariable: 'USER')]) {
                                sh """
                                    # Super hack for some TTY issues...
                                    npm i -g npm-cli-login
                                    NPM_USER="${USER}" NPM_PASS="${PASS}" NPM_EMAIL="acadiadev@vibrenthealth.com" NPM_REGISTRY="${vibrentregistry}" npm-cli-login
                                """
                                if (branch == 'develop') {
                                    sh """
                                        # publish
                                        npm publish --tag next --tag develop --tag latest --registry=${vibrentregistry} --scope=@vibrent
                                    """
                                }
                                if (branchType == 'release') {
                                    sh """
                                        # publish
                                        npm publish --tag latest --registry=${vibrentregistry} --scope=@vibrent
                                    """
                                }
                            }
                        }
                    }
                }
            },
            test: {}
        )
    }
}
