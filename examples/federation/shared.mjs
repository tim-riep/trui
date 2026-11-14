// Copyright 2026 The TRUI Authors
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

// Modules that host and remotes share as singletons. Every application that
// takes part must share at least react, react-dom and @tim-riep/trui/core, so
// that there is one React and one set of TRUI contexts.

const trui = '^0.2.0';
const react = '^19.0.0';

export const shared = {
  react: { singleton: true, requiredVersion: react },
  'react-dom': { singleton: true, requiredVersion: react },
  'react/jsx-runtime': { singleton: true, requiredVersion: react },
  'react-dom/client': { singleton: true, requiredVersion: react },
  '@tim-riep/trui': { singleton: true, requiredVersion: trui },
  '@tim-riep/trui/core': { singleton: true, requiredVersion: trui },
  '@tim-riep/trui/icons': { singleton: true, requiredVersion: trui },
};
