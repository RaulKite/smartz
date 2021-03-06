import React from 'react';

import FileHashWidget from './hash-group/FileHashWidget';
import StringHashWidget from './hash-group/StringHashWidget';
import UnixTimeWidget from './UnixTimeWidget';
import EthCount from './EthCount';
import MerkleRootWidget from './MerkleRootWidget';
import MerkleProofWidget from './MerkleProofWidget';

import CheckboxWidget from './redefinitions/CheckboxWidget';
import RadioWidget from './redefinitions/RadioWidget';

// widgets for react-jsonschema-form
const widgetList = {
  // own widgets
  fileHash: (props) => <FileHashWidget {...props} />,
  stringHash: (props) => <StringHashWidget {...props} />,
  unixTime: (props) => <UnixTimeWidget {...props} />,
  ethCount: (props) => <EthCount {...props} />,
  merkleRoot: (props) => <MerkleRootWidget {...props}/>,
  merkleProof: (props) => <MerkleProofWidget {...props}/>,

  // redefinition internal widgets
  CheckboxWidget: (props) => <CheckboxWidget {...props} />,
  RadioWidget: (props) => <RadioWidget {...props} />,
};

export default widgetList;
