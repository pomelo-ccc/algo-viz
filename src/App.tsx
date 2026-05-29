import { Router, Route } from '@solidjs/router';
import Layout from './components/Layout';
import Home from './pages/Home';
import Sorting from './pages/Sorting';
import Searching from './pages/Searching';
import Graph from './pages/Graph';
import DataStructures from './pages/DataStructures';
import Advanced from './pages/Advanced';
import Backtracking from './pages/Backtracking';
import Pathfinding from './pages/Pathfinding';
import Strings from './pages/Strings';
import Greedy from './pages/Greedy';
import DivideConquer from './pages/DivideConquer';

import BitManipulation from './pages/BitManipulation';
import MathAlgorithms from './pages/MathAlgorithms';
import Geometry from './pages/Geometry';
import StringsAdvanced from './pages/StringsAdvanced';
import AdvancedDataStructures from './pages/AdvancedDataStructures';
import NetworkFlow from './pages/NetworkFlow';
import RandomizedAlgorithms from './pages/RandomizedAlgorithms';
import CompressionAlgorithms from './pages/CompressionAlgorithms';
import Cryptography from './pages/Cryptography';
import MachineLearning from './pages/MachineLearning';
import ImageProcessing from './pages/ImageProcessing';

import NLP from './pages/NLP';

import Evolutionary from './pages/Evolutionary';

import Distributed from './pages/Distributed';

import GameAlgorithms from './pages/GameAlgorithms';

import OperatingSystems from './pages/OperatingSystems';

import DatabaseAlgorithms from './pages/DatabaseAlgorithms';

export default function App() {
  return (
    <Router root={Layout}>
      <Route path="/" component={Home} />
      <Route path="/sorting" component={Sorting} />
      <Route path="/searching" component={Searching} />
      <Route path="/graph" component={Graph} />
      <Route path="/greedy" component={Greedy} />
      <Route path="/divide-conquer" component={DivideConquer} />
      <Route path="/bit-manipulation" component={BitManipulation} />
      <Route path="/math" component={MathAlgorithms} />
      <Route path="/geometry" component={Geometry} />
      <Route path="/strings-advanced" component={StringsAdvanced} />
      <Route path="/advanced-data-structures" component={AdvancedDataStructures} />
      <Route path="/network-flow" component={NetworkFlow} />
      <Route path="/randomized" component={RandomizedAlgorithms} />
      <Route path="/compression" component={CompressionAlgorithms} />
      <Route path="/cryptography" component={Cryptography} />
      <Route path="/machine-learning" component={MachineLearning} />
      <Route path="/image-processing" component={ImageProcessing} />
      <Route path="/nlp" component={NLP} />
      <Route path="/evolutionary" component={Evolutionary} />
      <Route path="/distributed" component={Distributed} />
      <Route path="/game-algorithms" component={GameAlgorithms} />
      <Route path="/operating-systems" component={OperatingSystems} />
      <Route path="/database" component={DatabaseAlgorithms} />
      <Route path="/data-structures" component={DataStructures} />
      <Route path="/advanced" component={Advanced} />
      <Route path="/backtracking" component={Backtracking} />
      <Route path="/pathfinding" component={Pathfinding} />
      <Route path="/strings" component={Strings} />
    </Router>
  );
}
