
from constructor_engine.api import ConstructorInstance
from smartz.eth.contracts import make_generic_function_spec, merge_function_titles2specs


class Constructor(ConstructorInstance):

    def get_params(self):
        json_schema = {
            "type": "object",
            "required": [
                "name", "variants"
            ],
            "additionalProperties": False,

            "properties": {
                "name": {
                    "title": "Ballot name",
                    "type": "string",
                    "minLength": 3,
                    "maxLength": 300,
                    "pattern": "^[a-zA-Z,\. ]+$"
                },

                "variants": {
                    "title": "Variants",
                    "type": "array",
                    "minItems": 1,
                    "maxItems": 100,
                    "items": {
                        "type": "object",
                        "required": ["variant"],
                        "additionalProperties": False,

                        "properties": {
                             "variant": {
                                "title": "Variant",
                                "type": "string",
                                "minLength": 3,
                                "maxLength": 100,
                                "pattern": "^[a-zA-Z,\. ]+$"
                            },
                        }
                    }
                }

            }
        }

        ui_schema = {}

        return {
            "schema": json_schema,
            "ui_schema": ui_schema
        }

    def construct(self, fields):
        variants_code = ''

        for variant_id, variant in enumerate(fields['variants']):
            variant_descr = variant['variant']

            variants_code += """
                variants.push('{variant_descr}');variantIds[sha256('{variant_descr}')] = {variant_id};
            """.format(
                variant_descr=variant_descr,
                variant_id=variant_id+1
            )

        source = self.__class__._TEMPLATE \
            .replace('%name%', fields['name']) \
            .replace('%variants_code%', variants_code)

        return {
            'result': "success",
            'source': source,
            'contract_name': "SimpleBallot"
        }

    def post_construct(self, fields, abi_array):

        function_titles = {
            'ballotName': {
                'title': 'Get ballot name',
            },

            'variants': {
                'title': 'Get variant name by ID',
                'inputs': [{
                    'title': 'Variant ID',
                }]
            },

            'isVoted': {
                'title': 'Has address voted?',
                'inputs': [{
                    'title': 'Address to check',
                }]
            },

            'vote': {
                'title': 'Vote',
                'description': 'Vote by variant ID',
                'inputs': [{
                    'title': 'Variant ID',
                }]
            },

            'voteByName': {
                'title': 'Vote',
                'description': 'Vote by variant name',
                'inputs': [{
                    'title': 'Variant name',
                }]
            },

            'getVotesCount': {
                'title': 'Get votes count',
                'description': 'Get votes count by variant ID',
                'inputs': [{
                    'title': 'Variant ID',
                }]
            },

            'getVotesCountByName': {
                'title': 'Get votes count',
                'description': 'Get votes count by variant name',
                'inputs': [{
                    'title': 'Variant name',
                }]
            },


            'getWinner': {
                'title': 'Get winning variant',
                'description': 'Returns ID, name and votes vount of winning variant',
            },
        }

        return {
            'function_specs': merge_function_titles2specs(make_generic_function_spec(abi_array), function_titles),

            'dashboard_functions': ['ballotName', 'getWinner']
        }


    # language=Solidity
    _TEMPLATE = """
pragma solidity ^0.4.18;

/**
 * @title Simple Ballot
 */
contract SimpleBallot {

    string public ballotName;

    string[] variants;

    mapping(uint=>uint) votesCount;
    mapping(address=>bool) public isVoted;

    mapping(bytes32=>uint) variantIds;

    function SimpleBallot() public payable {
        ballotName = '%name%';

        variants.push(''); // for starting variants from 1 (non-programmers oriented)

        %variants_code%

        assert(variants.length <= 100);
    }

    modifier hasNotVoted() {
        require(!isVoted[msg.sender]);

        _;
    }

    modifier validVariantId(uint _variantId) {
        require(_variantId>=1 && _variantId<variants.length);

        _;
    }

    /**
     * Vote by variant id
     */
    function vote(uint _variantId)
        public
        validVariantId(_variantId)
        hasNotVoted
    {
        votesCount[_variantId]++;
        isVoted[msg.sender] = true;
    }

    /**
     * Vote by variant name
     */
    function voteByName(string _variantName)
        public
        hasNotVoted
    {
        uint variantId = variantIds[ sha256(_variantName) ];
        require(variantId!=0);

        votesCount[variantId]++;
        isVoted[msg.sender] = true;
    }

    /**
     * Get votes count of variant (by id)
     */
    function getVotesCount(uint _variantId)
        public
        view
        validVariantId(_variantId)
        returns (uint)
    {

        return votesCount[_variantId];
    }

    /**
     * Get votes count of variant (by name)
     */
    function getVotesCountByName(string _variantName) public view returns (uint) {
        uint variantId = variantIds[ sha256(_variantName) ];
        require(variantId!=0);

        return votesCount[variantId];
    }

    /**
     * Get winning variant (with votes count)
     */
    function getWinner() public view returns (uint id, string name, uint votes) {
        votes = votesCount[1];
        id = 1;
        for (uint i=2; i<variants.length; ++i) {
            if (votesCount[i] > votes) {
                votes = votesCount[i];
                id = i;
            }
        }
        name = variants[id];
    }
}


    """