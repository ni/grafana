module github.com/grafana/grafana/pkg/codegen

go 1.23.7

require (
	cuelang.org/go v0.11.1
	github.com/dave/dst v0.27.3
	github.com/grafana/codejen v0.0.4-0.20230321061741-77f656893a3d
	github.com/grafana/cog v0.0.18
	github.com/grafana/cuetsy v0.1.11
	github.com/matryer/is v1.4.1
)

require (
	github.com/cockroachdb/apd/v2 v2.0.2 // indirect
	github.com/dave/jennifer v1.6.0 // indirect
	github.com/davecgh/go-spew v1.1.2-0.20180830191138-d8f796af33cc // indirect
	github.com/emicklei/proto v1.13.2 // indirect
	github.com/expr-lang/expr v1.17.0 // indirect
	github.com/getkin/kin-openapi v0.129.0 // indirect
	github.com/go-openapi/jsonpointer v0.21.0 // indirect
	github.com/go-openapi/swag v0.23.0 // indirect
	github.com/golang/glog v1.2.4 // indirect
	github.com/google/go-cmp v0.7.0 // indirect
	github.com/google/uuid v1.6.0 // indirect
	github.com/hashicorp/errwrap v1.1.0 // indirect
	github.com/hashicorp/go-multierror v1.1.1 // indirect
	github.com/huandu/xstrings v1.5.0 // indirect
	github.com/josharian/intern v1.0.0 // indirect
	github.com/kr/text v0.2.0 // indirect
	github.com/lib/pq v1.10.9 // indirect
	github.com/mailru/easyjson v0.7.7 // indirect
	github.com/mitchellh/go-wordwrap v1.0.1 // indirect
	github.com/mohae/deepcopy v0.0.0-20170929034955-c48cc78d4826 // indirect
	github.com/mpvl/unique v0.0.0-20150818121801-cbe035fff7de // indirect
	github.com/oasdiff/yaml v0.0.0-20241210131133-6b86fb107d80 // indirect
	github.com/oasdiff/yaml3 v0.0.0-20241210130736-a94c01f36349 // indirect
	github.com/perimeterx/marshmallow v1.1.5 // indirect
	github.com/pkg/errors v0.9.1 // indirect
	github.com/protocolbuffers/txtpbfmt v0.0.0-20241112170944-20d2c9ebc01d // indirect
	github.com/santhosh-tekuri/jsonschema/v5 v5.3.1 // indirect
	github.com/sergi/go-diff v1.3.2-0.20230802210424-5b0b94c5c0d3 // indirect
	github.com/ugorji/go/codec v1.2.11 // indirect
	github.com/xlab/treeprint v1.2.0 // indirect
	github.com/yalue/merged_fs v1.3.0 // indirect
	golang.org/x/mod v0.22.0 // indirect
	golang.org/x/net v0.36.0 // indirect
	golang.org/x/sync v0.11.0 // indirect
	golang.org/x/text v0.22.0 // indirect
	golang.org/x/tools v0.29.0 // indirect
	gopkg.in/yaml.v3 v3.0.1 // indirect
)

replace cuelang.org/go => github.com/grafana/cue v0.0.0-20230926092038-971951014e3f // @grafana/grafana-as-code

replace github.com/protocolbuffers/txtpbfmt => github.com/protocolbuffers/txtpbfmt v0.0.0-20220428173112-74888fd59c2b
