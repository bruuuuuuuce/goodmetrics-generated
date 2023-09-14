import * as path from "path";
import * as glob from 'glob';
import {execSync} from "child_process";

// path where the generated code goes
const generatedCodePath = path.resolve(__dirname, "src");

// path to protos files
const goodmetricsProtos = glob.sync(
    path.resolve(__dirname, 'proto', '**/*.proto')
);

// generating code from goodmetrics protos
execSync(`PATH=node_modules/protoc-gen-ts/bin/:$PATH protoc --js_out=import_style=commonjs,binary:${generatedCodePath} --proto_path=${__dirname} -I=/usr/local/include --ts_out=${generatedCodePath} ${goodmetricsProtos.join(" ")}`, {
    stdio: 'inherit',
})
