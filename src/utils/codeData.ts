export type Language = 'javascript' | 'typescript' | 'python' | 'cpp' | 'java';

export const languageLabels: Record<Language, string> = {
  javascript: 'JavaScript',
  typescript: 'TypeScript',
  python: 'Python',
  cpp: 'C++',
  java: 'Java',
};

export interface AlgorithmCode {
  javascript: string;
  typescript: string;
  python: string;
  cpp: string;
  java: string;
}

export const sortingCodes: Record<string, AlgorithmCode> = {
  bubble: {
    javascript: `function bubbleSort(arr) {
  const n = arr.length;
  for (let i = 0; i < n - 1; i++) {
    for (let j = 0; j < n - i - 1; j++) {
      if (arr[j] > arr[j + 1]) {
        [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
      }
    }
  }
  return arr;
}`,
    typescript: `function bubbleSort(arr: number[]): number[] {
  const n = arr.length;
  for (let i = 0; i < n - 1; i++) {
    for (let j = 0; j < n - i - 1; j++) {
      if (arr[j] > arr[j + 1]) {
        [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
      }
    }
  }
  return arr;
}`,
    python: `def bubble_sort(arr):
    n = len(arr)
    for i in range(n - 1):
        for j in range(n - i - 1):
            if arr[j] > arr[j + 1]:
                arr[j], arr[j + 1] = arr[j + 1], arr[j]
    return arr`,
    cpp: `void bubbleSort(vector<int>& arr) {
    int n = arr.size();
    for (int i = 0; i < n - 1; i++) {
        for (int j = 0; j < n - i - 1; j++) {
            if (arr[j] > arr[j + 1]) {
                swap(arr[j], arr[j + 1]);
            }
        }
    }
}`,
    java: `public static void bubbleSort(int[] arr) {
    int n = arr.length;
    for (int i = 0; i < n - 1; i++) {
        for (int j = 0; j < n - i - 1; j++) {
            if (arr[j] > arr[j + 1]) {
                int temp = arr[j];
                arr[j] = arr[j + 1];
                arr[j + 1] = temp;
            }
        }
    }
}`,
  },
  selection: {
    javascript: `function selectionSort(arr) {
  const n = arr.length;
  for (let i = 0; i < n - 1; i++) {
    let minIdx = i;
    for (let j = i + 1; j < n; j++) {
      if (arr[j] < arr[minIdx]) minIdx = j;
    }
    [arr[i], arr[minIdx]] = [arr[minIdx], arr[i]];
  }
  return arr;
}`,
    typescript: `function selectionSort(arr: number[]): number[] {
  const n = arr.length;
  for (let i = 0; i < n - 1; i++) {
    let minIdx = i;
    for (let j = i + 1; j < n; j++) {
      if (arr[j] < arr[minIdx]) minIdx = j;
    }
    [arr[i], arr[minIdx]] = [arr[minIdx], arr[i]];
  }
  return arr;
}`,
    python: `def selection_sort(arr):
    n = len(arr)
    for i in range(n - 1):
        min_idx = i
        for j in range(i + 1, n):
            if arr[j] < arr[min_idx]:
                min_idx = j
        arr[i], arr[min_idx] = arr[min_idx], arr[i]
    return arr`,
    cpp: `void selectionSort(vector<int>& arr) {
    int n = arr.size();
    for (int i = 0; i < n - 1; i++) {
        int minIdx = i;
        for (int j = i + 1; j < n; j++) {
            if (arr[j] < arr[minIdx]) minIdx = j;
        }
        swap(arr[i], arr[minIdx]);
    }
}`,
    java: `public static void selectionSort(int[] arr) {
    int n = arr.length;
    for (int i = 0; i < n - 1; i++) {
        int minIdx = i;
        for (int j = i + 1; j < n; j++) {
            if (arr[j] < arr[minIdx]) minIdx = j;
        }
        int temp = arr[i];
        arr[i] = arr[minIdx];
        arr[minIdx] = temp;
    }
}`,
  },
  insertion: {
    javascript: `function insertionSort(arr) {
  const n = arr.length;
  for (let i = 1; i < n; i++) {
    const key = arr[i];
    let j = i - 1;
    while (j >= 0 && arr[j] > key) {
      arr[j + 1] = arr[j];
      j--;
    }
    arr[j + 1] = key;
  }
  return arr;
}`,
    typescript: `function insertionSort(arr: number[]): number[] {
  const n = arr.length;
  for (let i = 1; i < n; i++) {
    const key = arr[i];
    let j = i - 1;
    while (j >= 0 && arr[j] > key) {
      arr[j + 1] = arr[j];
      j--;
    }
    arr[j + 1] = key;
  }
  return arr;
}`,
    python: `def insertion_sort(arr):
    for i in range(1, len(arr)):
        key = arr[i]
        j = i - 1
        while j >= 0 and arr[j] > key:
            arr[j + 1] = arr[j]
            j -= 1
        arr[j + 1] = key
    return arr`,
    cpp: `void insertionSort(vector<int>& arr) {
    int n = arr.size();
    for (int i = 1; i < n; i++) {
        int key = arr[i];
        int j = i - 1;
        while (j >= 0 && arr[j] > key) {
            arr[j + 1] = arr[j];
            j--;
        }
        arr[j + 1] = key;
    }
}`,
    java: `public static void insertionSort(int[] arr) {
    int n = arr.length;
    for (int i = 1; i < n; i++) {
        int key = arr[i];
        int j = i - 1;
        while (j >= 0 && arr[j] > key) {
            arr[j + 1] = arr[j];
            j--;
        }
        arr[j + 1] = key;
    }
}`,
  },
  quick: {
    javascript: `function quickSort(arr, low = 0, high = arr.length - 1) {
  if (low < high) {
    const pi = partition(arr, low, high);
    quickSort(arr, low, pi - 1);
    quickSort(arr, pi + 1, high);
  }
  return arr;
}

function partition(arr, low, high) {
  const pivot = arr[high];
  let i = low - 1;
  for (let j = low; j < high; j++) {
    if (arr[j] < pivot) {
      i++;
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
  }
  [arr[i + 1], arr[high]] = [arr[high], arr[i + 1]];
  return i + 1;
}`,
    typescript: `function quickSort(arr: number[], low = 0, high = arr.length - 1): number[] {
  if (low < high) {
    const pi = partition(arr, low, high);
    quickSort(arr, low, pi - 1);
    quickSort(arr, pi + 1, high);
  }
  return arr;
}

function partition(arr: number[], low: number, high: number): number {
  const pivot = arr[high];
  let i = low - 1;
  for (let j = low; j < high; j++) {
    if (arr[j] < pivot) {
      i++;
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
  }
  [arr[i + 1], arr[high]] = [arr[high], arr[i + 1]];
  return i + 1;
}`,
    python: `def quick_sort(arr, low=0, high=None):
    if high is None:
        high = len(arr) - 1
    if low < high:
        pi = partition(arr, low, high)
        quick_sort(arr, low, pi - 1)
        quick_sort(arr, pi + 1, high)
    return arr

def partition(arr, low, high):
    pivot = arr[high]
    i = low - 1
    for j in range(low, high):
        if arr[j] < pivot:
            i += 1
            arr[i], arr[j] = arr[j], arr[i]
    arr[i + 1], arr[high] = arr[high], arr[i + 1]
    return i + 1`,
    cpp: `void quickSort(vector<int>& arr, int low, int high) {
    if (low < high) {
        int pi = partition(arr, low, high);
        quickSort(arr, low, pi - 1);
        quickSort(arr, pi + 1, high);
    }
}

int partition(vector<int>& arr, int low, int high) {
    int pivot = arr[high];
    int i = low - 1;
    for (int j = low; j < high; j++) {
        if (arr[j] < pivot) {
            i++;
            swap(arr[i], arr[j]);
        }
    }
    swap(arr[i + 1], arr[high]);
    return i + 1;
}`,
    java: `public static void quickSort(int[] arr, int low, int high) {
    if (low < high) {
        int pi = partition(arr, low, high);
        quickSort(arr, low, pi - 1);
        quickSort(arr, pi + 1, high);
    }
}

public static int partition(int[] arr, int low, int high) {
    int pivot = arr[high];
    int i = low - 1;
    for (int j = low; j < high; j++) {
        if (arr[j] < pivot) {
            i++;
            int temp = arr[i];
            arr[i] = arr[j];
            arr[j] = temp;
        }
    }
    int temp = arr[i + 1];
    arr[i + 1] = arr[high];
    arr[high] = temp;
    return i + 1;
}`,
  },
  merge: {
    javascript: `function mergeSort(arr, left = 0, right = arr.length - 1) {
  if (left < right) {
    const mid = Math.floor((left + right) / 2);
    mergeSort(arr, left, mid);
    mergeSort(arr, mid + 1, right);
    merge(arr, left, mid, right);
  }
  return arr;
}

function merge(arr, left, mid, right) {
  const leftArr = arr.slice(left, mid + 1);
  const rightArr = arr.slice(mid + 1, right + 1);
  let i = 0, j = 0, k = left;
  while (i < leftArr.length && j < rightArr.length) {
    arr[k++] = leftArr[i] <= rightArr[j] ? leftArr[i++] : rightArr[j++];
  }
  while (i < leftArr.length) arr[k++] = leftArr[i++];
  while (j < rightArr.length) arr[k++] = rightArr[j++];
}`,
    typescript: `function mergeSort(arr: number[], left = 0, right = arr.length - 1): number[] {
  if (left < right) {
    const mid = Math.floor((left + right) / 2);
    mergeSort(arr, left, mid);
    mergeSort(arr, mid + 1, right);
    merge(arr, left, mid, right);
  }
  return arr;
}

function merge(arr: number[], left: number, mid: number, right: number) {
  const leftArr = arr.slice(left, mid + 1);
  const rightArr = arr.slice(mid + 1, right + 1);
  let i = 0, j = 0, k = left;
  while (i < leftArr.length && j < rightArr.length) {
    arr[k++] = leftArr[i] <= rightArr[j] ? leftArr[i++] : rightArr[j++];
  }
  while (i < leftArr.length) arr[k++] = leftArr[i++];
  while (j < rightArr.length) arr[k++] = rightArr[j++];
}`,
    python: `def merge_sort(arr, left=0, right=None):
    if right is None:
        right = len(arr) - 1
    if left < right:
        mid = (left + right) // 2
        merge_sort(arr, left, mid)
        merge_sort(arr, mid + 1, right)
        merge(arr, left, mid, right)
    return arr

def merge(arr, left, mid, right):
    left_arr = arr[left:mid + 1]
    right_arr = arr[mid + 1:right + 1]
    i = j = 0
    k = left
    while i < len(left_arr) and j < len(right_arr):
        if left_arr[i] <= right_arr[j]:
            arr[k] = left_arr[i]
            i += 1
        else:
            arr[k] = right_arr[j]
            j += 1
        k += 1
    while i < len(left_arr):
        arr[k] = left_arr[i]
        i += 1
        k += 1
    while j < len(right_arr):
        arr[k] = right_arr[j]
        j += 1
        k += 1`,
    cpp: `void mergeSort(vector<int>& arr, int left, int right) {
    if (left < right) {
        int mid = left + (right - left) / 2;
        mergeSort(arr, left, mid);
        mergeSort(arr, mid + 1, right);
        merge(arr, left, mid, right);
    }
}

void merge(vector<int>& arr, int left, int mid, int right) {
    vector<int> leftArr(arr.begin() + left, arr.begin() + mid + 1);
    vector<int> rightArr(arr.begin() + mid + 1, arr.begin() + right + 1);
    int i = 0, j = 0, k = left;
    while (i < leftArr.size() && j < rightArr.size()) {
        arr[k++] = (leftArr[i] <= rightArr[j]) ? leftArr[i++] : rightArr[j++];
    }
    while (i < leftArr.size()) arr[k++] = leftArr[i++];
    while (j < rightArr.size()) arr[k++] = rightArr[j++];
}`,
    java: `public static void mergeSort(int[] arr, int left, int right) {
    if (left < right) {
        int mid = left + (right - left) / 2;
        mergeSort(arr, left, mid);
        mergeSort(arr, mid + 1, right);
        merge(arr, left, mid, right);
    }
}

public static void merge(int[] arr, int left, int mid, int right) {
    int[] leftArr = Arrays.copyOfRange(arr, left, mid + 1);
    int[] rightArr = Arrays.copyOfRange(arr, mid + 1, right + 1);
    int i = 0, j = 0, k = left;
    while (i < leftArr.length && j < rightArr.length) {
        arr[k++] = (leftArr[i] <= rightArr[j]) ? leftArr[i++] : rightArr[j++];
    }
    while (i < leftArr.length) arr[k++] = leftArr[i++];
    while (j < rightArr.length) arr[k++] = rightArr[j++];
}`,
  },
  heap: {
    javascript: `function heapSort(arr) {
  const n = arr.length;
  for (let i = Math.floor(n / 2) - 1; i >= 0; i--) {
    heapify(arr, n, i);
  }
  for (let i = n - 1; i > 0; i--) {
    [arr[0], arr[i]] = [arr[i], arr[0]];
    heapify(arr, i, 0);
  }
  return arr;
}

function heapify(arr, n, i) {
  let largest = i;
  const left = 2 * i + 1;
  const right = 2 * i + 2;
  if (left < n && arr[left] > arr[largest]) largest = left;
  if (right < n && arr[right] > arr[largest]) largest = right;
  if (largest !== i) {
    [arr[i], arr[largest]] = [arr[largest], arr[i]];
    heapify(arr, n, largest);
  }
}`,
    typescript: `function heapSort(arr: number[]): number[] {
  const n = arr.length;
  for (let i = Math.floor(n / 2) - 1; i >= 0; i--) {
    heapify(arr, n, i);
  }
  for (let i = n - 1; i > 0; i--) {
    [arr[0], arr[i]] = [arr[i], arr[0]];
    heapify(arr, i, 0);
  }
  return arr;
}

function heapify(arr: number[], n: number, i: number) {
  let largest = i;
  const left = 2 * i + 1;
  const right = 2 * i + 2;
  if (left < n && arr[left] > arr[largest]) largest = left;
  if (right < n && arr[right] > arr[largest]) largest = right;
  if (largest !== i) {
    [arr[i], arr[largest]] = [arr[largest], arr[i]];
    heapify(arr, n, largest);
  }
}`,
    python: `def heap_sort(arr):
    n = len(arr)
    for i in range(n // 2 - 1, -1, -1):
        heapify(arr, n, i)
    for i in range(n - 1, 0, -1):
        arr[0], arr[i] = arr[i], arr[0]
        heapify(arr, i, 0)
    return arr

def heapify(arr, n, i):
    largest = i
    left = 2 * i + 1
    right = 2 * i + 2
    if left < n and arr[left] > arr[largest]:
        largest = left
    if right < n and arr[right] > arr[largest]:
        largest = right
    if largest != i:
        arr[i], arr[largest] = arr[largest], arr[i]
        heapify(arr, n, largest)`,
    cpp: `void heapSort(vector<int>& arr) {
    int n = arr.size();
    for (int i = n / 2 - 1; i >= 0; i--) heapify(arr, n, i);
    for (int i = n - 1; i > 0; i--) {
        swap(arr[0], arr[i]);
        heapify(arr, i, 0);
    }
}

void heapify(vector<int>& arr, int n, int i) {
    int largest = i;
    int left = 2 * i + 1;
    int right = 2 * i + 2;
    if (left < n && arr[left] > arr[largest]) largest = left;
    if (right < n && arr[right] > arr[largest]) largest = right;
    if (largest != i) {
        swap(arr[i], arr[largest]);
        heapify(arr, n, largest);
    }
}`,
    java: `public static void heapSort(int[] arr) {
    int n = arr.length;
    for (int i = n / 2 - 1; i >= 0; i--) heapify(arr, n, i);
    for (int i = n - 1; i > 0; i--) {
        int temp = arr[0]; arr[0] = arr[i]; arr[i] = temp;
        heapify(arr, i, 0);
    }
}

public static void heapify(int[] arr, int n, int i) {
    int largest = i;
    int left = 2 * i + 1;
    int right = 2 * i + 2;
    if (left < n && arr[left] > arr[largest]) largest = left;
    if (right < n && arr[right] > arr[largest]) largest = right;
    if (largest != i) {
        int temp = arr[i]; arr[i] = arr[largest]; arr[largest] = temp;
        heapify(arr, n, largest);
    }
}`,
  },
  shell: {
    javascript: `function shellSort(arr) {
  const n = arr.length;
  for (let gap = Math.floor(n / 2); gap > 0; gap = Math.floor(gap / 2)) {
    for (let i = gap; i < n; i++) {
      const temp = arr[i];
      let j = i;
      while (j >= gap && arr[j - gap] > temp) {
        arr[j] = arr[j - gap];
        j -= gap;
      }
      arr[j] = temp;
    }
  }
  return arr;
}`,
    typescript: `function shellSort(arr: number[]): number[] {
  const n = arr.length;
  for (let gap = Math.floor(n / 2); gap > 0; gap = Math.floor(gap / 2)) {
    for (let i = gap; i < n; i++) {
      const temp = arr[i];
      let j = i;
      while (j >= gap && arr[j - gap] > temp) {
        arr[j] = arr[j - gap];
        j -= gap;
      }
      arr[j] = temp;
    }
  }
  return arr;
}`,
    python: `def shell_sort(arr):
    n = len(arr)
    gap = n // 2
    while gap > 0:
        for i in range(gap, n):
            temp = arr[i]
            j = i
            while j >= gap and arr[j - gap] > temp:
                arr[j] = arr[j - gap]
                j -= gap
            arr[j] = temp
        gap //= 2
    return arr`,
    cpp: `void shellSort(vector<int>& arr) {
    int n = arr.size();
    for (int gap = n / 2; gap > 0; gap /= 2) {
        for (int i = gap; i < n; i++) {
            int temp = arr[i];
            int j = i;
            while (j >= gap && arr[j - gap] > temp) {
                arr[j] = arr[j - gap];
                j -= gap;
            }
            arr[j] = temp;
        }
    }
}`,
    java: `public static void shellSort(int[] arr) {
    int n = arr.length;
    for (int gap = n / 2; gap > 0; gap /= 2) {
        for (int i = gap; i < n; i++) {
            int temp = arr[i];
            int j = i;
            while (j >= gap && arr[j - gap] > temp) {
                arr[j] = arr[j - gap];
                j -= gap;
            }
            arr[j] = temp;
        }
    }
}`,
  },
  counting: {
    javascript: `function countingSort(arr) {
  const max = Math.max(...arr);
  const count = new Array(max + 1).fill(0);
  const output = new Array(arr.length);
  for (let i = 0; i < arr.length; i++) count[arr[i]]++;
  for (let i = 1; i <= max; i++) count[i] += count[i - 1];
  for (let i = arr.length - 1; i >= 0; i--) {
    output[count[arr[i]] - 1] = arr[i];
    count[arr[i]]--;
  }
  return output;
}`,
    typescript: `function countingSort(arr: number[]): number[] {
  const max = Math.max(...arr);
  const count = new Array(max + 1).fill(0);
  const output = new Array(arr.length);
  for (let i = 0; i < arr.length; i++) count[arr[i]]++;
  for (let i = 1; i <= max; i++) count[i] += count[i - 1];
  for (let i = arr.length - 1; i >= 0; i--) {
    output[count[arr[i]] - 1] = arr[i];
    count[arr[i]]--;
  }
  return output;
}`,
    python: `def counting_sort(arr):
    max_val = max(arr)
    count = [0] * (max_val + 1)
    output = [0] * len(arr)
    for x in arr:
        count[x] += 1
    for i in range(1, max_val + 1):
        count[i] += count[i - 1]
    for i in range(len(arr) - 1, -1, -1):
        output[count[arr[i]] - 1] = arr[i]
        count[arr[i]] -= 1
    return output`,
    cpp: `vector<int> countingSort(vector<int>& arr) {
    int maxVal = *max_element(arr.begin(), arr.end());
    vector<int> count(maxVal + 1, 0);
    vector<int> output(arr.size());
    for (int x : arr) count[x]++;
    for (int i = 1; i <= maxVal; i++) count[i] += count[i - 1];
    for (int i = arr.size() - 1; i >= 0; i--) {
        output[count[arr[i]] - 1] = arr[i];
        count[arr[i]]--;
    }
    return output;
}`,
    java: `public static int[] countingSort(int[] arr) {
    int maxVal = Arrays.stream(arr).max().getAsInt();
    int[] count = new int[maxVal + 1];
    int[] output = new int[arr.length];
    for (int x : arr) count[x]++;
    for (int i = 1; i <= maxVal; i++) count[i] += count[i - 1];
    for (int i = arr.length - 1; i >= 0; i--) {
        output[count[arr[i]] - 1] = arr[i];
        count[arr[i]]--;
    }
    return output;
}`,
  },
  radix: {
    javascript: `function radixSort(arr) {
  const max = Math.max(...arr);
  for (let exp = 1; Math.floor(max / exp) > 0; exp *= 10) {
    countingSortByDigit(arr, exp);
  }
  return arr;
}

function countingSortByDigit(arr, exp) {
  const output = new Array(arr.length);
  const count = new Array(10).fill(0);
  for (let i = 0; i < arr.length; i++) count[Math.floor(arr[i] / exp) % 10]++;
  for (let i = 1; i < 10; i++) count[i] += count[i - 1];
  for (let i = arr.length - 1; i >= 0; i--) {
    const digit = Math.floor(arr[i] / exp) % 10;
    output[count[digit] - 1] = arr[i];
    count[digit]--;
  }
  for (let i = 0; i < arr.length; i++) arr[i] = output[i];
}`,
    typescript: `function radixSort(arr: number[]): number[] {
  const max = Math.max(...arr);
  for (let exp = 1; Math.floor(max / exp) > 0; exp *= 10) {
    countingSortByDigit(arr, exp);
  }
  return arr;
}

function countingSortByDigit(arr: number[], exp: number) {
  const output = new Array(arr.length);
  const count = new Array(10).fill(0);
  for (let i = 0; i < arr.length; i++) count[Math.floor(arr[i] / exp) % 10]++;
  for (let i = 1; i < 10; i++) count[i] += count[i - 1];
  for (let i = arr.length - 1; i >= 0; i--) {
    const digit = Math.floor(arr[i] / exp) % 10;
    output[count[digit] - 1] = arr[i];
    count[digit]--;
  }
  for (let i = 0; i < arr.length; i++) arr[i] = output[i];
}`,
    python: `def radix_sort(arr):
    max_val = max(arr)
    exp = 1
    while max_val // exp > 0:
        counting_sort_by_digit(arr, exp)
        exp *= 10
    return arr

def counting_sort_by_digit(arr, exp):
    output = [0] * len(arr)
    count = [0] * 10
    for i in range(len(arr)):
        count[(arr[i] // exp) % 10] += 1
    for i in range(1, 10):
        count[i] += count[i - 1]
    for i in range(len(arr) - 1, -1, -1):
        digit = (arr[i] // exp) % 10
        output[count[digit] - 1] = arr[i]
        count[digit] -= 1
    for i in range(len(arr)):
        arr[i] = output[i]`,
    cpp: `void radixSort(vector<int>& arr) {
    int maxVal = *max_element(arr.begin(), arr.end());
    for (int exp = 1; maxVal / exp > 0; exp *= 10) {
        countingSortByDigit(arr, exp);
    }
}

void countingSortByDigit(vector<int>& arr, int exp) {
    vector<int> output(arr.size());
    vector<int> count(10, 0);
    for (int x : arr) count[(x / exp) % 10]++;
    for (int i = 1; i < 10; i++) count[i] += count[i - 1];
    for (int i = arr.size() - 1; i >= 0; i--) {
        int digit = (arr[i] / exp) % 10;
        output[count[digit] - 1] = arr[i];
        count[digit]--;
    }
    for (int i = 0; i < arr.size(); i++) arr[i] = output[i];
}`,
    java: `public static void radixSort(int[] arr) {
    int maxVal = Arrays.stream(arr).max().getAsInt();
    for (int exp = 1; maxVal / exp > 0; exp *= 10) {
        countingSortByDigit(arr, exp);
    }
}

public static void countingSortByDigit(int[] arr, int exp) {
    int[] output = new int[arr.length];
    int[] count = new int[10];
    for (int x : arr) count[(x / exp) % 10]++;
    for (int i = 1; i < 10; i++) count[i] += count[i - 1];
    for (int i = arr.length - 1; i >= 0; i--) {
        int digit = (arr[i] / exp) % 10;
        output[count[digit] - 1] = arr[i];
        count[digit]--;
    }
    System.arraycopy(output, 0, arr, 0, arr.length);
}`,
  },
};

export const searchingCodes: Record<string, AlgorithmCode> = {
  linear: {
    javascript: `function linearSearch(arr, target) {
  for (let i = 0; i < arr.length; i++) {
    if (arr[i] === target) return i;
  }
  return -1;
}`,
    typescript: `function linearSearch(arr: number[], target: number): number {
  for (let i = 0; i < arr.length; i++) {
    if (arr[i] === target) return i;
  }
  return -1;
}`,
    python: `def linear_search(arr, target):
    for i in range(len(arr)):
        if arr[i] == target:
            return i
    return -1`,
    cpp: `int linearSearch(const vector<int>& arr, int target) {
    for (size_t i = 0; i < arr.size(); i++) {
        if (arr[i] == target) return static_cast<int>(i);
    }
    return -1;
}`,
    java: `public static int linearSearch(int[] arr, int target) {
    for (int i = 0; i < arr.length; i++) {
        if (arr[i] == target) return i;
    }
    return -1;
}`,
  },
  binary: {
    javascript: `function binarySearch(arr, target) {
  let left = 0, right = arr.length - 1;
  while (left <= right) {
    const mid = Math.floor((left + right) / 2);
    if (arr[mid] === target) return mid;
    if (arr[mid] < target) left = mid + 1;
    else right = mid - 1;
  }
  return -1;
}`,
    typescript: `function binarySearch(arr: number[], target: number): number {
  let left = 0, right = arr.length - 1;
  while (left <= right) {
    const mid = Math.floor((left + right) / 2);
    if (arr[mid] === target) return mid;
    if (arr[mid] < target) left = mid + 1;
    else right = mid - 1;
  }
  return -1;
}`,
    python: `def binary_search(arr, target):
    left, right = 0, len(arr) - 1
    while left <= right:
        mid = (left + right) // 2
        if arr[mid] == target:
            return mid
        if arr[mid] < target:
            left = mid + 1
        else:
            right = mid - 1
    return -1`,
    cpp: `int binarySearch(const vector<int>& arr, int target) {
    int left = 0, right = static_cast<int>(arr.size()) - 1;
    while (left <= right) {
        int mid = left + (right - left) / 2;
        if (arr[mid] == target) return mid;
        if (arr[mid] < target) left = mid + 1;
        else right = mid - 1;
    }
    return -1;
}`,
    java: `public static int binarySearch(int[] arr, int target) {
    int left = 0, right = arr.length - 1;
    while (left <= right) {
        int mid = left + (right - left) / 2;
        if (arr[mid] == target) return mid;
        if (arr[mid] < target) left = mid + 1;
        else right = mid - 1;
    }
    return -1;
}`,
  },
};

export const graphCodes: Record<string, AlgorithmCode> = {
  bfs: {
    javascript: `function bfs(graph, start) {
  const visited = new Set();
  const queue = [start];
  while (queue.length > 0) {
    const node = queue.shift();
    if (visited.has(node)) continue;
    visited.add(node);
    for (const neighbor of graph[node]) {
      if (!visited.has(neighbor)) queue.push(neighbor);
    }
  }
  return visited;
}`,
    typescript: `function bfs(graph: Map<number, number[]>, start: number): Set<number> {
  const visited = new Set<number>();
  const queue = [start];
  while (queue.length > 0) {
    const node = queue.shift()!;
    if (visited.has(node)) continue;
    visited.add(node);
    for (const neighbor of graph.get(node) || []) {
      if (!visited.has(neighbor)) queue.push(neighbor);
    }
  }
  return visited;
}`,
    python: `from collections import deque

def bfs(graph, start):
    visited = set()
    queue = deque([start])
    while queue:
        node = queue.popleft()
        if node in visited:
            continue
        visited.add(node)
        for neighbor in graph[node]:
            if neighbor not in visited:
                queue.append(neighbor)
    return visited`,
    cpp: `void bfs(const unordered_map<int, vector<int>>& graph, int start) {
    unordered_set<int> visited;
    queue<int> q;
    q.push(start);
    while (!q.empty()) {
        int node = q.front(); q.pop();
        if (visited.count(node)) continue;
        visited.insert(node);
        for (int neighbor : graph.at(node)) {
            if (!visited.count(neighbor)) q.push(neighbor);
        }
    }
}`,
    java: `public static Set<Integer> bfs(Map<Integer, List<Integer>> graph, int start) {
    Set<Integer> visited = new HashSet<>();
    Queue<Integer> queue = new LinkedList<>();
    queue.add(start);
    while (!queue.isEmpty()) {
        int node = queue.poll();
        if (visited.contains(node)) continue;
        visited.add(node);
        for (int neighbor : graph.getOrDefault(node, List.of())) {
            if (!visited.contains(neighbor)) queue.add(neighbor);
        }
    }
    return visited;
}`,
  },
  dfs: {
    javascript: `function dfs(graph, start) {
  const visited = new Set();
  const stack = [start];
  while (stack.length > 0) {
    const node = stack.pop();
    if (visited.has(node)) continue;
    visited.add(node);
    for (const neighbor of graph[node]) {
      if (!visited.has(neighbor)) stack.push(neighbor);
    }
  }
  return visited;
}`,
    typescript: `function dfs(graph: Map<number, number[]>, start: number): Set<number> {
  const visited = new Set<number>();
  const stack = [start];
  while (stack.length > 0) {
    const node = stack.pop()!;
    if (visited.has(node)) continue;
    visited.add(node);
    for (const neighbor of graph.get(node) || []) {
      if (!visited.has(neighbor)) stack.push(neighbor);
    }
  }
  return visited;
}`,
    python: `def dfs(graph, start):
    visited = set()
    stack = [start]
    while stack:
        node = stack.pop()
        if node in visited:
            continue
        visited.add(node)
        for neighbor in graph[node]:
            if neighbor not in visited:
                stack.append(neighbor)
    return visited`,
    cpp: `void dfs(const unordered_map<int, vector<int>>& graph, int start) {
    unordered_set<int> visited;
    stack<int> s;
    s.push(start);
    while (!s.empty()) {
        int node = s.top(); s.pop();
        if (visited.count(node)) continue;
        visited.insert(node);
        for (int neighbor : graph.at(node)) {
            if (!visited.count(neighbor)) s.push(neighbor);
        }
    }
}`,
    java: `public static Set<Integer> dfs(Map<Integer, List<Integer>> graph, int start) {
    Set<Integer> visited = new HashSet<>();
    Stack<Integer> stack = new Stack<>();
    stack.push(start);
    while (!stack.isEmpty()) {
        int node = stack.pop();
        if (visited.contains(node)) continue;
        visited.add(node);
        for (int neighbor : graph.getOrDefault(node, List.of())) {
            if (!visited.contains(neighbor)) stack.push(neighbor);
        }
    }
    return visited;
}`,
  },
  dijkstra: {
    javascript: `function dijkstra(graph, start) {
  const distances = new Map();
  const visited = new Set();
  distances.set(start, 0);
  while (visited.size < graph.size) {
    let minNode = null, minDist = Infinity;
    for (const [node, dist] of distances) {
      if (!visited.has(node) && dist < minDist) {
        minDist = dist; minNode = node;
      }
    }
    if (minNode === null) break;
    visited.add(minNode);
    for (const [neighbor, weight] of graph.get(minNode)) {
      const newDist = minDist + weight;
      if (!distances.has(neighbor) || newDist < distances.get(neighbor)) {
        distances.set(neighbor, newDist);
      }
    }
  }
  return distances;
}`,
    typescript: `function dijkstra(graph: Map<number, Map<number, number>>, start: number): Map<number, number> {
  const distances = new Map<number, number>();
  const visited = new Set<number>();
  distances.set(start, 0);
  while (visited.size < graph.size) {
    let minNode: number | null = null, minDist = Infinity;
    for (const [node, dist] of distances) {
      if (!visited.has(node) && dist < minDist) { minDist = dist; minNode = node; }
    }
    if (minNode === null) break;
    visited.add(minNode);
    for (const [neighbor, weight] of graph.get(minNode) || []) {
      const newDist = minDist + weight;
      if (!distances.has(neighbor) || newDist < distances.get(neighbor)!) {
        distances.set(neighbor, newDist);
      }
    }
  }
  return distances;
}`,
    python: `import heapq

def dijkstra(graph, start):
    distances = {start: 0}
    visited = set()
    heap = [(0, start)]
    while heap:
        dist, node = heapq.heappop(heap)
        if node in visited:
            continue
        visited.add(node)
        for neighbor, weight in graph[node].items():
            new_dist = dist + weight
            if neighbor not in distances or new_dist < distances[neighbor]:
                distances[neighbor] = new_dist
                heapq.heappush(heap, (new_dist, neighbor))
    return distances`,
    cpp: `unordered_map<int, int> dijkstra(const unordered_map<int, unordered_map<int, int>>& graph, int start) {
    unordered_map<int, int> distances;
    unordered_set<int> visited;
    distances[start] = 0;
    while (visited.size() < graph.size()) {
        int minNode = -1, minDist = INT_MAX;
        for (const auto& [node, dist] : distances) {
            if (!visited.count(node) && dist < minDist) { minDist = dist; minNode = node; }
        }
        if (minNode == -1) break;
        visited.insert(minNode);
        for (const auto& [neighbor, weight] : graph.at(minNode)) {
            int newDist = minDist + weight;
            if (!distances.count(neighbor) || newDist < distances[neighbor]) {
                distances[neighbor] = newDist;
            }
        }
    }
    return distances;
}`,
    java: `public static Map<Integer, Integer> dijkstra(Map<Integer, Map<Integer, Integer>> graph, int start) {
    Map<Integer, Integer> distances = new HashMap<>();
    Set<Integer> visited = new HashSet<>();
    distances.put(start, 0);
    while (visited.size() < graph.size()) {
        int minNode = -1, minDist = Integer.MAX_VALUE;
        for (Map.Entry<Integer, Integer> entry : distances.entrySet()) {
            if (!visited.contains(entry.getKey()) && entry.getValue() < minDist) {
                minDist = entry.getValue(); minNode = entry.getKey();
            }
        }
        if (minNode == -1) break;
        visited.add(minNode);
        for (Map.Entry<Integer, Integer> entry : graph.getOrDefault(minNode, Map.of()).entrySet()) {
            int newDist = minDist + entry.getValue();
            if (!distances.containsKey(entry.getKey()) || newDist < distances.get(entry.getKey())) {
                distances.put(entry.getKey(), newDist);
            }
        }
    }
    return distances;
}`,
  },
};

export const nlpCodes: Record<string, AlgorithmCode> = {
  wordfreq: {
    javascript: `function wordFreq(text) {
  const words = text.toLowerCase().split(/\\s+/);
  const freq = new Map();
  for (const word of words) {
    if (word) freq.set(word, (freq.get(word) || 0) + 1);
  }
  return freq;
}`,
    typescript: `function wordFreq(text: string): Map<string, number> {
  const words = text.toLowerCase().split(/\\s+/);
  const freq = new Map<string, number>();
  for (const word of words) {
    if (word) freq.set(word, (freq.get(word) || 0) + 1);
  }
  return freq;
}`,
    python: `def word_freq(text):
    words = text.lower().split()
    freq = {}
    for word in words:
        freq[word] = freq.get(word, 0) + 1
    return freq`,
    cpp: `map<string, int> wordFreq(const string& text) {
    map<string, int> freq;
    stringstream ss(text);
    string word;
    while (ss >> word) {
        transform(word.begin(), word.end(), word.begin(), ::tolower);
        freq[word]++;
    }
    return freq;
}`,
    java: `public static Map<String, Integer> wordFreq(String text) {
    Map<String, Integer> freq = new HashMap<>();
    String[] words = text.toLowerCase().split("\\s+");
    for (String word : words) {
        if (!word.isEmpty()) {
            freq.put(word, freq.getOrDefault(word, 0) + 1);
        }
    }
    return freq;
}`,
  },
  tfidf: {
    javascript: `function tfidf(docs) {
  const wordCount = new Map();
  const docCount = docs.length;
  for (const doc of docs) {
    const words = doc.toLowerCase().split(/\\s+/);
    for (const word of words) {
      if (word) wordCount.set(word, (wordCount.get(word) || 0) + 1);
    }
  }
  const tfidf = new Map();
  for (const doc of docs) {
    const words = doc.toLowerCase().split(/\\s+/);
    const docWordCount = new Map();
    for (const word of words) {
      if (word) docWordCount.set(word, (docWordCount.get(word) || 0) + 1);
    }
    for (const [word, count] of docWordCount.entries()) {
      const tf = count / words.length;
      const idf = Math.log(docCount / (wordCount.get(word) || 1));
      tfidf.set(word, (tfidf.get(word) || 0) + tf * idf);
    }
  }
  return tfidf;
}`,
    typescript: `function tfidf(docs: string[]): Map<string, number> {
  const wordCount = new Map<string, number>();
  const docCount = docs.length;
  for (const doc of docs) {
    const words = doc.toLowerCase().split(/\\s+/);
    for (const word of words) {
      if (word) wordCount.set(word, (wordCount.get(word) || 0) + 1);
    }
  }
  const tfidf = new Map<string, number>();
  for (const doc of docs) {
    const words = doc.toLowerCase().split(/\\s+/);
    const docWordCount = new Map<string, number>();
    for (const word of words) {
      if (word) docWordCount.set(word, (docWordCount.get(word) || 0) + 1);
    }
    for (const [word, count] of docWordCount.entries()) {
      const tf = count / words.length;
      const idf = Math.log(docCount / (wordCount.get(word) || 1));
      tfidf.set(word, (tfidf.get(word) || 0) + tf * idf);
    }
  }
  return tfidf;
}`,
    python: `import math

def tfidf(docs):
    word_count = {}
    doc_count = len(docs)
    for doc in docs:
        words = doc.lower().split()
        for word in words:
            word_count[word] = word_count.get(word, 0) + 1
    tfidf = {}
    for doc in docs:
        words = doc.lower().split()
        doc_word_count = {}
        for word in words:
            doc_word_count[word] = doc_word_count.get(word, 0) + 1
        for word, count in doc_word_count.items():
            tf = count / len(words)
            idf = math.log(doc_count / word_count.get(word, 1))
            tfidf[word] = tfidf.get(word, 0) + tf * idf
    return tfidf`,
    cpp: `map<string, double> tfidf(const vector<string>& docs) {
    map<string, int> wordCount;
    int docCount = docs.size();
    for (const auto& doc : docs) {
        stringstream ss(doc);
        string word;
        while (ss >> word) {
            transform(word.begin(), word.end(), word.begin(), ::tolower);
            wordCount[word]++;
        }
    }
    map<string, double> tfidf;
    for (const auto& doc : docs) {
        stringstream ss(doc);
        string word;
        map<string, int> docWordCount;
        while (ss >> word) {
            transform(word.begin(), word.end(), word.begin(), ::tolower);
            docWordCount[word]++;
        }
        for (const auto& [word, count] : docWordCount) {
            double tf = static_cast<double>(count) / docWordCount.size();
            double idf = log(static_cast<double>(docCount) / wordCount[word]);
            tfidf[word] += tf * idf;
        }
    }
    return tfidf;
}`,
    java: `public static Map<String, Double> tfidf(List<String> docs) {
    Map<String, Integer> wordCount = new HashMap<>();
    int docCount = docs.size();
    for (String doc : docs) {
        String[] words = doc.toLowerCase().split("\\s+");
        for (String word : words) {
            wordCount.put(word, wordCount.getOrDefault(word, 0) + 1);
        }
    }
    Map<String, Double> tfidf = new HashMap<>();
    for (String doc : docs) {
        String[] words = doc.toLowerCase().split("\\s+");
        Map<String, Integer> docWordCount = new HashMap<>();
        for (String word : words) {
            docWordCount.put(word, docWordCount.getOrDefault(word, 0) + 1);
        }
        for (Map.Entry<String, Integer> entry : docWordCount.entrySet()) {
            double tf = (double) entry.getValue() / words.length;
            double idf = Math.log((double) docCount / wordCount.get(entry.getKey()));
            tfidf.put(entry.getKey(), tfidf.getOrDefault(entry.getKey(), 0.0) + tf * idf);
        }
    }
    return tfidf;
}`,
  },
  sentiment: {
    javascript: `function sentimentAnalysis(text) {
  const positiveWords = ['love', 'great', 'excellent', 'good', 'amazing', 'wonderful', 'fantastic', 'best', 'happy', 'joy'];
  const negativeWords = ['hate', 'terrible', 'bad', 'awful', 'worst', 'sad', 'angry', 'disappointed', 'horrible', 'poor'];
  let positive = 0;
  let negative = 0;
  const words = text.toLowerCase().split(/\\s+/);
  for (const word of words) {
    if (positiveWords.includes(word)) positive++;
    else if (negativeWords.includes(word)) negative++;
  }
  if (positive > negative) return '正面';
  if (negative > positive) return '负面';
  return '中性';
}`,
    typescript: `function sentimentAnalysis(text: string): string {
  const positiveWords = ['love', 'great', 'excellent', 'good', 'amazing', 'wonderful', 'fantastic', 'best', 'happy', 'joy'];
  const negativeWords = ['hate', 'terrible', 'bad', 'awful', 'worst', 'sad', 'angry', 'disappointed', 'horrible', 'poor'];
  let positive = 0;
  let negative = 0;
  const words = text.toLowerCase().split(/\\s+/);
  for (const word of words) {
    if (positiveWords.includes(word)) positive++;
    else if (negativeWords.includes(word)) negative++;
  }
  if (positive > negative) return '正面';
  if (negative > positive) return '负面';
  return '中性';
}`,
    python: `def sentiment_analysis(text):
    positive_words = {'love', 'great', 'excellent', 'good', 'amazing', 'wonderful', 'fantastic', 'best', 'happy', 'joy'}
    negative_words = {'hate', 'terrible', 'bad', 'awful', 'worst', 'sad', 'angry', 'disappointed', 'horrible', 'poor'}
    positive = 0
    negative = 0
    words = text.lower().split()
    for word in words:
        if word in positive_words:
            positive += 1
        elif word in negative_words:
            negative += 1
    if positive > negative:
        return '正面'
    if negative > positive:
        return '负面'
    return '中性'`,
    cpp: `string sentimentAnalysis(const string& text) {
    vector<string> positiveWords = {"love", "great", "excellent", "good", "amazing", "wonderful", "fantastic", "best", "happy", "joy"};
    vector<string> negativeWords = {"hate", "terrible", "bad", "awful", "worst", "sad", "angry", "disappointed", "horrible", "poor"};
    int positive = 0, negative = 0;
    stringstream ss(text);
    string word;
    while (ss >> word) {
        transform(word.begin(), word.end(), word.begin(), ::tolower);
        if (find(positiveWords.begin(), positiveWords.end(), word) != positiveWords.end()) positive++;
        else if (find(negativeWords.begin(), negativeWords.end(), word) != negativeWords.end()) negative++;
    }
    if (positive > negative) return "正面";
    if (negative > positive) return "负面";
    return "中性";
}`,
    java: `public static String sentimentAnalysis(String text) {
    List<String> positiveWords = Arrays.asList("love", "great", "excellent", "good", "amazing", "wonderful", "fantastic", "best", "happy", "joy");
    List<String> negativeWords = Arrays.asList("hate", "terrible", "bad", "awful", "worst", "sad", "angry", "disappointed", "horrible", "poor");
    int positive = 0, negative = 0;
    String[] words = text.toLowerCase().split("\\s+");
    for (String word : words) {
        if (positiveWords.contains(word)) positive++;
        else if (negativeWords.contains(word)) negative++;
    }
    if (positive > negative) return "正面";
    if (negative > positive) return "负面";
    return "中性";
}`,
  },
};

export const evolutionaryCodes: Record<string, AlgorithmCode> = {
  genetic: {
    javascript: `function geneticAlgorithm(popSize, generations, mutationRate) {
  let population = [];
  for (let i = 0; i < popSize; i++) {
    population.push(Array.from({ length: 10 }, () => Math.random() > 0.5 ? '1' : '0').join(''));
  }
  for (let gen = 0; gen < generations; gen++) {
    const fitness = population.map(ind => ind.split('').filter(c => c === '1').length);
    const newPop = [];
    for (let i = 0; i < popSize; i++) {
      const a = Math.floor(Math.random() * popSize);
      const b = Math.floor(Math.random() * popSize);
      newPop.push(fitness[a] > fitness[b] ? population[a] : population[b]);
    }
    for (let i = 0; i < popSize - 1; i += 2) {
      if (Math.random() < 0.7) {
        const point = Math.floor(Math.random() * 10);
        const child1 = newPop[i].slice(0, point) + newPop[i + 1].slice(point);
        const child2 = newPop[i + 1].slice(0, point) + newPop[i].slice(point);
        newPop[i] = child1;
        newPop[i + 1] = child2;
      }
    }
    for (let i = 0; i < popSize; i++) {
      const chars = newPop[i].split('');
      for (let j = 0; j < chars.length; j++) {
        if (Math.random() < mutationRate) {
          chars[j] = chars[j] === '1' ? '0' : '1';
        }
      }
      newPop[i] = chars.join('');
    }
    population = newPop;
  }
  return population;
}`,
    typescript: `function geneticAlgorithm(popSize: number, generations: number, mutationRate: number): string[] {
  let population: string[] = [];
  for (let i = 0; i < popSize; i++) {
    population.push(Array.from({ length: 10 }, () => Math.random() > 0.5 ? '1' : '0').join(''));
  }
  for (let gen = 0; gen < generations; gen++) {
    const fitness = population.map(ind => ind.split('').filter(c => c === '1').length);
    const newPop: string[] = [];
    for (let i = 0; i < popSize; i++) {
      const a = Math.floor(Math.random() * popSize);
      const b = Math.floor(Math.random() * popSize);
      newPop.push(fitness[a] > fitness[b] ? population[a] : population[b]);
    }
    for (let i = 0; i < popSize - 1; i += 2) {
      if (Math.random() < 0.7) {
        const point = Math.floor(Math.random() * 10);
        const child1 = newPop[i].slice(0, point) + newPop[i + 1].slice(point);
        const child2 = newPop[i + 1].slice(0, point) + newPop[i].slice(point);
        newPop[i] = child1;
        newPop[i + 1] = child2;
      }
    }
    for (let i = 0; i < popSize; i++) {
      const chars = newPop[i].split('');
      for (let j = 0; j < chars.length; j++) {
        if (Math.random() < mutationRate) {
          chars[j] = chars[j] === '1' ? '0' : '1';
        }
      }
      newPop[i] = chars.join('');
    }
    population = newPop;
  }
  return population;
}`,
    python: `import random

def genetic_algorithm(pop_size, generations, mutation_rate):
    population = [''.join(random.choice('01') for _ in range(10)) for _ in range(pop_size)]
    for gen in range(generations):
        fitness = [ind.count('1') for ind in population]
        new_pop = []
        for _ in range(pop_size):
            a, b = random.randint(0, pop_size - 1), random.randint(0, pop_size - 1)
            new_pop.append(population[a] if fitness[a] > fitness[b] else population[b])
        for i in range(0, pop_size - 1, 2):
            if random.random() < 0.7:
                point = random.randint(0, 10)
                child1 = new_pop[i][:point] + new_pop[i + 1][point:]
                child2 = new_pop[i + 1][:point] + new_pop[i][point:]
                new_pop[i] = child1
                new_pop[i + 1] = child2
        for i in range(pop_size):
            chars = list(new_pop[i])
            for j in range(len(chars)):
                if random.random() < mutation_rate:
                    chars[j] = '0' if chars[j] == '1' else '1'
            new_pop[i] = ''.join(chars)
        population = new_pop
    return population`,
    cpp: `vector<string> geneticAlgorithm(int popSize, int generations, double mutationRate) {
    vector<string> population;
    for (int i = 0; i < popSize; i++) {
        string ind;
        for (int j = 0; j < 10; j++) ind += (rand() % 2) ? '1' : '0';
        population.push_back(ind);
    }
    for (int gen = 0; gen < generations; gen++) {
        vector<int> fitness;
        for (const auto& ind : population) {
            fitness.push_back(count(ind.begin(), ind.end(), '1'));
        }
        vector<string> newPop;
        for (int i = 0; i < popSize; i++) {
            int a = rand() % popSize, b = rand() % popSize;
            newPop.push_back(fitness[a] > fitness[b] ? population[a] : population[b]);
        }
        for (int i = 0; i < popSize - 1; i += 2) {
            if ((double) rand() / RAND_MAX < 0.7) {
                int point = rand() % 10;
                string child1 = newPop[i].substr(0, point) + newPop[i + 1].substr(point);
                string child2 = newPop[i + 1].substr(0, point) + newPop[i].substr(point);
                newPop[i] = child1;
                newPop[i + 1] = child2;
            }
        }
        for (int i = 0; i < popSize; i++) {
            for (int j = 0; j < newPop[i].size(); j++) {
                if ((double) rand() / RAND_MAX < mutationRate) {
                    newPop[i][j] = (newPop[i][j] == '1') ? '0' : '1';
                }
            }
        }
        population = newPop;
    }
    return population;
}`,
    java: `public static List<String> geneticAlgorithm(int popSize, int generations, double mutationRate) {
    List<String> population = new ArrayList<>();
    Random rand = new Random();
    for (int i = 0; i < popSize; i++) {
        StringBuilder ind = new StringBuilder();
        for (int j = 0; j < 10; j++) ind.append(rand.nextBoolean() ? '1' : '0');
        population.add(ind.toString());
    }
    for (int gen = 0; gen < generations; gen++) {
        List<Integer> fitness = new ArrayList<>();
        for (String ind : population) {
            fitness.add((int) ind.chars().filter(c -> c == '1').count());
        }
        List<String> newPop = new ArrayList<>();
        for (int i = 0; i < popSize; i++) {
            int a = rand.nextInt(popSize), b = rand.nextInt(popSize);
            newPop.add(fitness.get(a) > fitness.get(b) ? population.get(a) : population.get(b));
        }
        for (int i = 0; i < popSize - 1; i += 2) {
            if (rand.nextDouble() < 0.7) {
                int point = rand.nextInt(10);
                String child1 = newPop.get(i).substring(0, point) + newPop.get(i + 1).substring(point);
                String child2 = newPop.get(i + 1).substring(0, point) + newPop.get(i).substring(point);
                newPop.set(i, child1);
                newPop.set(i + 1, child2);
            }
        }
        for (int i = 0; i < popSize; i++) {
            char[] chars = newPop.get(i).toCharArray();
            for (int j = 0; j < chars.length; j++) {
                if (rand.nextDouble() < mutationRate) {
                    chars[j] = (chars[j] == '1') ? '0' : '1';
                }
            }
            newPop.set(i, new String(chars));
        }
        population = newPop;
    }
    return population;
}`,
  },
  pso: {
    javascript: `function pso(particles, iterations) {
  let positions = [];
  let velocities = [];
  let bestPositions = [];
  let bestFitness = -Infinity;
  let globalBest = 0;
  for (let i = 0; i < particles; i++) {
    positions[i] = Math.random() * 10 - 5;
    velocities[i] = Math.random() * 2 - 1;
    bestPositions[i] = positions[i];
    let fitness = -positions[i] * positions[i];
    if (fitness > bestFitness) {
      bestFitness = fitness;
      globalBest = positions[i];
    }
  }
  for (let iter = 0; iter < iterations; iter++) {
    for (let i = 0; i < particles; i++) {
      velocities[i] = 0.7 * velocities[i] +
        1.5 * Math.random() * (bestPositions[i] - positions[i]) +
        1.5 * Math.random() * (globalBest - positions[i]);
      positions[i] += velocities[i];
      let fitness = -positions[i] * positions[i];
      if (fitness > -bestPositions[i] * bestPositions[i]) {
        bestPositions[i] = positions[i];
      }
      if (fitness > bestFitness) {
        bestFitness = fitness;
        globalBest = positions[i];
      }
    }
  }
  return globalBest;
}`,
    typescript: `function pso(particles: number, iterations: number): number {
  let positions: number[] = [];
  let velocities: number[] = [];
  let bestPositions: number[] = [];
  let bestFitness = -Infinity;
  let globalBest = 0;
  for (let i = 0; i < particles; i++) {
    positions[i] = Math.random() * 10 - 5;
    velocities[i] = Math.random() * 2 - 1;
    bestPositions[i] = positions[i];
    let fitness = -positions[i] * positions[i];
    if (fitness > bestFitness) {
      bestFitness = fitness;
      globalBest = positions[i];
    }
  }
  for (let iter = 0; iter < iterations; iter++) {
    for (let i = 0; i < particles; i++) {
      velocities[i] = 0.7 * velocities[i] +
        1.5 * Math.random() * (bestPositions[i] - positions[i]) +
        1.5 * Math.random() * (globalBest - positions[i]);
      positions[i] += velocities[i];
      let fitness = -positions[i] * positions[i];
      if (fitness > -bestPositions[i] * bestPositions[i]) {
        bestPositions[i] = positions[i];
      }
      if (fitness > bestFitness) {
        bestFitness = fitness;
        globalBest = positions[i];
      }
    }
  }
  return globalBest;
}`,
    python: `import random

def pso(particles, iterations):
    positions = [random.random() * 10 - 5 for _ in range(particles)]
    velocities = [random.random() * 2 - 1 for _ in range(particles)]
    best_positions = positions[:]
    best_fitness = float('-inf')
    global_best = 0
    for i in range(particles):
        fitness = -positions[i] ** 2
        if fitness > best_fitness:
            best_fitness = fitness
            global_best = positions[i]
    for _ in range(iterations):
        for i in range(particles):
            velocities[i] = 0.7 * velocities[i] + \
                1.5 * random.random() * (best_positions[i] - positions[i]) + \
                1.5 * random.random() * (global_best - positions[i])
            positions[i] += velocities[i]
            fitness = -positions[i] ** 2
            if fitness > -best_positions[i] ** 2:
                best_positions[i] = positions[i]
            if fitness > best_fitness:
                best_fitness = fitness
                global_best = positions[i]
    return global_best`,
    cpp: `double pso(int particles, int iterations) {
    vector<double> positions(particles), velocities(particles), bestPositions(particles);
    double bestFitness = -numeric_limits<double>::infinity();
    double globalBest = 0;
    for (int i = 0; i < particles; i++) {
        positions[i] = (double) rand() / RAND_MAX * 10 - 5;
        velocities[i] = (double) rand() / RAND_MAX * 2 - 1;
        bestPositions[i] = positions[i];
        double fitness = -positions[i] * positions[i];
        if (fitness > bestFitness) {
            bestFitness = fitness;
            globalBest = positions[i];
        }
    }
    for (int iter = 0; iter < iterations; iter++) {
        for (int i = 0; i < particles; i++) {
            velocities[i] = 0.7 * velocities[i] +
                1.5 * ((double) rand() / RAND_MAX) * (bestPositions[i] - positions[i]) +
                1.5 * ((double) rand() / RAND_MAX) * (globalBest - positions[i]);
            positions[i] += velocities[i];
            double fitness = -positions[i] * positions[i];
            if (fitness > -bestPositions[i] * bestPositions[i]) {
                bestPositions[i] = positions[i];
            }
            if (fitness > bestFitness) {
                bestFitness = fitness;
                globalBest = positions[i];
            }
        }
    }
    return globalBest;
}`,
    java: `public static double pso(int particles, int iterations) {
    double[] positions = new double[particles];
    double[] velocities = new double[particles];
    double[] bestPositions = new double[particles];
    double bestFitness = Double.NEGATIVE_INFINITY;
    double globalBest = 0;
    Random rand = new Random();
    for (int i = 0; i < particles; i++) {
        positions[i] = rand.nextDouble() * 10 - 5;
        velocities[i] = rand.nextDouble() * 2 - 1;
        bestPositions[i] = positions[i];
        double fitness = -positions[i] * positions[i];
        if (fitness > bestFitness) {
            bestFitness = fitness;
            globalBest = positions[i];
        }
    }
    for (int iter = 0; iter < iterations; iter++) {
        for (int i = 0; i < particles; i++) {
            velocities[i] = 0.7 * velocities[i] +
                1.5 * rand.nextDouble() * (bestPositions[i] - positions[i]) +
                1.5 * rand.nextDouble() * (globalBest - positions[i]);
            positions[i] += velocities[i];
            double fitness = -positions[i] * positions[i];
            if (fitness > -bestPositions[i] * bestPositions[i]) {
                bestPositions[i] = positions[i];
            }
            if (fitness > bestFitness) {
                bestFitness = fitness;
                globalBest = positions[i];
            }
        }
    }
    return globalBest;
}`,
  },
  aco: {
    javascript: `function aco(ants, iterations) {
  const cities = 5;
  const distances = [[0, 2, 9, 10, 7], [2, 0, 6, 4, 3], [9, 6, 0, 8, 5], [10, 4, 8, 0, 6], [7, 3, 5, 6, 0]];
  let pheromones = Array.from({ length: cities }, () => Array(cities).fill(1.0));
  let bestPath = [];
  let bestLength = Infinity;
  for (let iter = 0; iter < iterations; iter++) {
    for (let ant = 0; ant < ants; ant++) {
      let visited = new Set();
      let path = [];
      let current = Math.floor(Math.random() * cities);
      path.push(current);
      visited.add(current);
      while (visited.size < cities) {
        let next = Math.floor(Math.random() * cities);
        if (!visited.has(next)) {
          path.push(next);
          visited.add(next);
          current = next;
        }
      }
      let length = 0;
      for (let i = 0; i < path.length - 1; i++) length += distances[path[i]][path[i + 1]];
      length += distances[path[path.length - 1]][path[0]];
      if (length < bestLength) {
        bestLength = length;
        bestPath = [...path];
      }
    }
    for (let i = 0; i < cities; i++) {
      for (let j = 0; j < cities; j++) {
        pheromones[i][j] *= 0.9;
      }
    }
  }
  return bestPath;
}`,
    typescript: `function aco(ants: number, iterations: number): number[] {
  const cities = 5;
  const distances = [[0, 2, 9, 10, 7], [2, 0, 6, 4, 3], [9, 6, 0, 8, 5], [10, 4, 8, 0, 6], [7, 3, 5, 6, 0]];
  let pheromones: number[][] = Array.from({ length: cities }, () => Array(cities).fill(1.0));
  let bestPath: number[] = [];
  let bestLength = Infinity;
  for (let iter = 0; iter < iterations; iter++) {
    for (let ant = 0; ant < ants; ant++) {
      let visited = new Set<number>();
      let path: number[] = [];
      let current = Math.floor(Math.random() * cities);
      path.push(current);
      visited.add(current);
      while (visited.size < cities) {
        let next = Math.floor(Math.random() * cities);
        if (!visited.has(next)) {
          path.push(next);
          visited.add(next);
          current = next;
        }
      }
      let length = 0;
      for (let i = 0; i < path.length - 1; i++) length += distances[path[i]][path[i + 1]];
      length += distances[path[path.length - 1]][path[0]];
      if (length < bestLength) {
        bestLength = length;
        bestPath = [...path];
      }
    }
    for (let i = 0; i < cities; i++) {
      for (let j = 0; j < cities; j++) {
        pheromones[i][j] *= 0.9;
      }
    }
  }
  return bestPath;
}`,
    python: `import random

def aco(ants, iterations):
    cities = 5
    distances = [[0, 2, 9, 10, 7], [2, 0, 6, 4, 3], [9, 6, 0, 8, 5], [10, 4, 8, 0, 6], [7, 3, 5, 6, 0]]
    pheromones = [[1.0] * cities for _ in range(cities)]
    best_path = []
    best_length = float('inf')
    for _ in range(iterations):
        for _ in range(ants):
            visited = set()
            path = []
            current = random.randint(0, cities - 1)
            path.append(current)
            visited.add(current)
            while len(visited) < cities:
                next_city = random.randint(0, cities - 1)
                if next_city not in visited:
                    path.append(next_city)
                    visited.add(next_city)
                    current = next_city
            length = 0
            for i in range(len(path) - 1):
                length += distances[path[i]][path[i + 1]]
            length += distances[path[-1]][path[0]]
            if length < best_length:
                best_length = length
                best_path = path[:]
        for i in range(cities):
            for j in range(cities):
                pheromones[i][j] *= 0.9
    return best_path`,
    cpp: `vector<int> aco(int ants, int iterations) {
    int cities = 5;
    vector<vector<int>> distances = {{0, 2, 9, 10, 7}, {2, 0, 6, 4, 3}, {9, 6, 0, 8, 5}, {10, 4, 8, 0, 6}, {7, 3, 5, 6, 0}};
    vector<vector<double>> pheromones(cities, vector<double>(cities, 1.0));
    vector<int> bestPath;
    int bestLength = INT_MAX;
    for (int iter = 0; iter < iterations; iter++) {
        for (int ant = 0; ant < ants; ant++) {
            unordered_set<int> visited;
            vector<int> path;
            int current = rand() % cities;
            path.push_back(current);
            visited.insert(current);
            while (visited.size() < cities) {
                int next = rand() % cities;
                if (visited.find(next) == visited.end()) {
                    path.push_back(next);
                    visited.insert(next);
                    current = next;
                }
            }
            int length = 0;
            for (size_t i = 0; i < path.size() - 1; i++) length += distances[path[i]][path[i + 1]];
            length += distances[path.back()][path[0]];
            if (length < bestLength) {
                bestLength = length;
                bestPath = path;
            }
        }
        for (int i = 0; i < cities; i++) {
            for (int j = 0; j < cities; j++) {
                pheromones[i][j] *= 0.9;
            }
        }
    }
    return bestPath;
}`,
    java: `public static List<Integer> aco(int ants, int iterations) {
    int cities = 5;
    int[][] distances = {{0, 2, 9, 10, 7}, {2, 0, 6, 4, 3}, {9, 6, 0, 8, 5}, {10, 4, 8, 0, 6}, {7, 3, 5, 6, 0}};
    double[][] pheromones = new double[cities][cities];
    for (int i = 0; i < cities; i++) Arrays.fill(pheromones[i], 1.0);
    List<Integer> bestPath = new ArrayList<>();
    int bestLength = Integer.MAX_VALUE;
    Random rand = new Random();
    for (int iter = 0; iter < iterations; iter++) {
        for (int ant = 0; ant < ants; ant++) {
            Set<Integer> visited = new HashSet<>();
            List<Integer> path = new ArrayList<>();
            int current = rand.nextInt(cities);
            path.add(current);
            visited.add(current);
            while (visited.size() < cities) {
                int next = rand.nextInt(cities);
                if (!visited.contains(next)) {
                    path.add(next);
                    visited.add(next);
                    current = next;
                }
            }
            int length = 0;
            for (int i = 0; i < path.size() - 1; i++) length += distances[path.get(i)][path.get(i + 1)];
            length += distances[path.get(path.size() - 1)][path.get(0)];
            if (length < bestLength) {
                bestLength = length;
                bestPath = new ArrayList<>(path);
            }
        }
        for (int i = 0; i < cities; i++) {
            for (int j = 0; j < cities; j++) {
                pheromones[i][j] *= 0.9;
            }
        }
    }
    return bestPath;
}`,
  },
};

export const distributedCodes: Record<string, AlgorithmCode> = {
  mapreduce: {
    javascript: `function mapReduce(data) {
  const words = data.split(/\\s+/);
  const mapResult = new Map();
  for (const word of words) {
    if (word) {
      mapResult.set(word, (mapResult.get(word) || 0) + 1);
    }
  }
  return mapResult;
}`,
    typescript: `function mapReduce(data: string): Map<string, number> {
  const words = data.split(/\\s+/);
  const mapResult = new Map<string, number>();
  for (const word of words) {
    if (word) {
      mapResult.set(word, (mapResult.get(word) || 0) + 1);
    }
  }
  return mapResult;
}`,
    python: `def map_reduce(data):
    words = data.split()
    map_result = {}
    for word in words:
        if word:
            map_result[word] = map_result.get(word, 0) + 1
    return map_result`,
    cpp: `map<string, int> mapReduce(const string& data) {
    map<string, int> mapResult;
    stringstream ss(data);
    string word;
    while (ss >> word) {
        mapResult[word]++;
    }
    return mapResult;
}`,
    java: `public static Map<String, Integer> mapReduce(String data) {
    Map<String, Integer> mapResult = new HashMap<>();
    String[] words = data.split("\\s+");
    for (String word : words) {
        if (!word.isEmpty()) {
            mapResult.put(word, mapResult.getOrDefault(word, 0) + 1);
        }
    }
    return mapResult;
}`,
  },
  consistentHashing: {
    javascript: `function consistentHashing(nodes, keys) {
  const virtualNodes = [];
  for (let i = 0; i < nodes * 3; i++) {
    virtualNodes.push(Math.floor(Math.random() * 360));
  }
  virtualNodes.sort((a, b) => a - b);
  const hashRing = new Map();
  for (let i = 0; i < keys; i++) {
    const keyHash = Math.floor(Math.random() * 360);
    let node = 0;
    for (let j = 0; j < virtualNodes.length; j++) {
      if (virtualNodes[j] >= keyHash) {
        node = Math.floor(j / 3);
        break;
      }
    }
    hashRing.set(i, node);
  }
  return hashRing;
}`,
    typescript: `function consistentHashing(nodes: number, keys: number): Map<number, number> {
  const virtualNodes: number[] = [];
  for (let i = 0; i < nodes * 3; i++) {
    virtualNodes.push(Math.floor(Math.random() * 360));
  }
  virtualNodes.sort((a, b) => a - b);
  const hashRing = new Map<number, number>();
  for (let i = 0; i < keys; i++) {
    const keyHash = Math.floor(Math.random() * 360);
    let node = 0;
    for (let j = 0; j < virtualNodes.length; j++) {
      if (virtualNodes[j] >= keyHash) {
        node = Math.floor(j / 3);
        break;
      }
    }
    hashRing.set(i, node);
  }
  return hashRing;
}`,
    python: `import random

def consistent_hashing(nodes, keys):
    virtual_nodes = [random.randint(0, 359) for _ in range(nodes * 3)]
    virtual_nodes.sort()
    hash_ring = {}
    for i in range(keys):
        key_hash = random.randint(0, 359)
        node = 0
        for j, vn in enumerate(virtual_nodes):
            if vn >= key_hash:
                node = j // 3
                break
        hash_ring[i] = node
    return hash_ring`,
    cpp: `map<int, int> consistentHashing(int nodes, int keys) {
    vector<int> virtualNodes;
    for (int i = 0; i < nodes * 3; i++) {
        virtualNodes.push_back(rand() % 360);
    }
    sort(virtualNodes.begin(), virtualNodes.end());
    map<int, int> hashRing;
    for (int i = 0; i < keys; i++) {
        int keyHash = rand() % 360;
        int node = 0;
        for (int j = 0; j < virtualNodes.size(); j++) {
            if (virtualNodes[j] >= keyHash) {
                node = j / 3;
                break;
            }
        }
        hashRing[i] = node;
    }
    return hashRing;
}`,
    java: `public static Map<Integer, Integer> consistentHashing(int nodes, int keys) {
    List<Integer> virtualNodes = new ArrayList<>();
    Random rand = new Random();
    for (int i = 0; i < nodes * 3; i++) {
        virtualNodes.add(rand.nextInt(360));
    }
    Collections.sort(virtualNodes);
    Map<Integer, Integer> hashRing = new HashMap<>();
    for (int i = 0; i < keys; i++) {
        int keyHash = rand.nextInt(360);
        int node = 0;
        for (int j = 0; j < virtualNodes.size(); j++) {
            if (virtualNodes.get(j) >= keyHash) {
                node = j / 3;
                break;
            }
        }
        hashRing.put(i, node);
    }
    return hashRing;
}`,
  },
  raft: {
    javascript: `function raft(nodes) {
  const votes = new Map();
  for (let i = 0; i < nodes; i++) {
    votes.set(i, 0);
  }
  let maxVotes = 0;
  let leader = -1;
  for (let i = 0; i < nodes; i++) {
    const voteCount = Math.floor(Math.random() * nodes);
    votes.set(i, voteCount);
    if (voteCount > maxVotes) {
      maxVotes = voteCount;
      leader = i;
    }
  }
  return leader;
}`,
    typescript: `function raft(nodes: number): number {
  const votes = new Map<number, number>();
  for (let i = 0; i < nodes; i++) {
    votes.set(i, 0);
  }
  let maxVotes = 0;
  let leader = -1;
  for (let i = 0; i < nodes; i++) {
    const voteCount = Math.floor(Math.random() * nodes);
    votes.set(i, voteCount);
    if (voteCount > maxVotes) {
      maxVotes = voteCount;
      leader = i;
    }
  }
  return leader;
}`,
    python: `import random

def raft(nodes):
    votes = {i: 0 for i in range(nodes)}
    max_votes = 0
    leader = -1
    for i in range(nodes):
        vote_count = random.randint(0, nodes - 1)
        votes[i] = vote_count
        if vote_count > max_votes:
            max_votes = vote_count
            leader = i
    return leader`,
    cpp: `int raft(int nodes) {
    map<int, int> votes;
    for (int i = 0; i < nodes; i++) {
        votes[i] = 0;
    }
    int maxVotes = 0;
    int leader = -1;
    for (int i = 0; i < nodes; i++) {
        int voteCount = rand() % nodes;
        votes[i] = voteCount;
        if (voteCount > maxVotes) {
            maxVotes = voteCount;
            leader = i;
        }
    }
    return leader;
}`,
    java: `public static int raft(int nodes) {
    Map<Integer, Integer> votes = new HashMap<>();
    for (int i = 0; i < nodes; i++) {
        votes.put(i, 0);
    }
    int maxVotes = 0;
    int leader = -1;
    Random rand = new Random();
    for (int i = 0; i < nodes; i++) {
        int voteCount = rand.nextInt(nodes);
        votes.put(i, voteCount);
        if (voteCount > maxVotes) {
            maxVotes = voteCount;
            leader = i;
        }
    }
    return leader;
}`,
  },
};

export const gameCodes: Record<string, AlgorithmCode> = {
  minimax: {
    javascript: `function minimax(node, depth, isMaximizing) {
  if (depth === 0) {
    return Math.floor(Math.random() * 10) - 5;
  }
  if (isMaximizing) {
    let maxEval = -Infinity;
    for (let i = 0; i < 2; i++) {
      const eval = minimax(node * 2 + i, depth - 1, false);
      maxEval = Math.max(maxEval, eval);
    }
    return maxEval;
  } else {
    let minEval = Infinity;
    for (let i = 0; i < 2; i++) {
      const eval = minimax(node * 2 + i, depth - 1, true);
      minEval = Math.min(minEval, eval);
    }
    return minEval;
  }
}`,
    typescript: `function minimax(node: number, depth: number, isMaximizing: boolean): number {
  if (depth === 0) {
    return Math.floor(Math.random() * 10) - 5;
  }
  if (isMaximizing) {
    let maxEval = -Infinity;
    for (let i = 0; i < 2; i++) {
      const eval = minimax(node * 2 + i, depth - 1, false);
      maxEval = Math.max(maxEval, eval);
    }
    return maxEval;
  } else {
    let minEval = Infinity;
    for (let i = 0; i < 2; i++) {
      const eval = minimax(node * 2 + i, depth - 1, true);
      minEval = Math.min(minEval, eval);
    }
    return minEval;
  }
}`,
    python: `import random

def minimax(node, depth, is_maximizing):
    if depth == 0:
        return random.randint(-5, 4)
    if is_maximizing:
        max_eval = float('-inf')
        for i in range(2):
            eval = minimax(node * 2 + i, depth - 1, False)
            max_eval = max(max_eval, eval)
        return max_eval
    else:
        min_eval = float('inf')
        for i in range(2):
            eval = minimax(node * 2 + i, depth - 1, True)
            min_eval = min(min_eval, eval)
        return min_eval`,
    cpp: `int minimax(int node, int depth, bool isMaximizing) {
    if (depth == 0) {
        return rand() % 10 - 5;
    }
    if (isMaximizing) {
        int maxEval = INT_MIN;
        for (int i = 0; i < 2; i++) {
            int eval = minimax(node * 2 + i, depth - 1, false);
            maxEval = max(maxEval, eval);
        }
        return maxEval;
    } else {
        int minEval = INT_MAX;
        for (int i = 0; i < 2; i++) {
            int eval = minimax(node * 2 + i, depth - 1, true);
            minEval = min(minEval, eval);
        }
        return minEval;
    }
}`,
    java: `public static int minimax(int node, int depth, boolean isMaximizing) {
    if (depth == 0) {
        return (int) (Math.random() * 10) - 5;
    }
    if (isMaximizing) {
        int maxEval = Integer.MIN_VALUE;
        for (int i = 0; i < 2; i++) {
            int eval = minimax(node * 2 + i, depth - 1, false);
            maxEval = Math.max(maxEval, eval);
        }
        return maxEval;
    } else {
        int minEval = Integer.MAX_VALUE;
        for (int i = 0; i < 2; i++) {
            int eval = minimax(node * 2 + i, depth - 1, true);
            minEval = Math.min(minEval, eval);
        }
        return minEval;
    }
}`,
  },
  alphaBeta: {
    javascript: `function alphaBeta(node, depth, alpha, beta, isMaximizing) {
  if (depth === 0) {
    return Math.floor(Math.random() * 10) - 5;
  }
  if (isMaximizing) {
    let maxEval = -Infinity;
    for (let i = 0; i < 2; i++) {
      const eval = alphaBeta(node * 2 + i, depth - 1, alpha, beta, false);
      maxEval = Math.max(maxEval, eval);
      alpha = Math.max(alpha, eval);
      if (beta <= alpha) break;
    }
    return maxEval;
  } else {
    let minEval = Infinity;
    for (let i = 0; i < 2; i++) {
      const eval = alphaBeta(node * 2 + i, depth - 1, alpha, beta, true);
      minEval = Math.min(minEval, eval);
      beta = Math.min(beta, eval);
      if (beta <= alpha) break;
    }
    return minEval;
  }
}`,
    typescript: `function alphaBeta(node: number, depth: number, alpha: number, beta: number, isMaximizing: boolean): number {
  if (depth === 0) {
    return Math.floor(Math.random() * 10) - 5;
  }
  if (isMaximizing) {
    let maxEval = -Infinity;
    for (let i = 0; i < 2; i++) {
      const eval = alphaBeta(node * 2 + i, depth - 1, alpha, beta, false);
      maxEval = Math.max(maxEval, eval);
      alpha = Math.max(alpha, eval);
      if (beta <= alpha) break;
    }
    return maxEval;
  } else {
    let minEval = Infinity;
    for (let i = 0; i < 2; i++) {
      const eval = alphaBeta(node * 2 + i, depth - 1, alpha, beta, true);
      minEval = Math.min(minEval, eval);
      beta = Math.min(beta, eval);
      if (beta <= alpha) break;
    }
    return minEval;
  }
}`,
    python: `import random

def alpha_beta(node, depth, alpha, beta, is_maximizing):
    if depth == 0:
        return random.randint(-5, 4)
    if is_maximizing:
        max_eval = float('-inf')
        for i in range(2):
            eval = alpha_beta(node * 2 + i, depth - 1, alpha, beta, False)
            max_eval = max(max_eval, eval)
            alpha = max(alpha, eval)
            if beta <= alpha:
                break
        return max_eval
    else:
        min_eval = float('inf')
        for i in range(2):
            eval = alpha_beta(node * 2 + i, depth - 1, alpha, beta, True)
            min_eval = min(min_eval, eval)
            beta = min(beta, eval)
            if beta <= alpha:
                break
        return min_eval`,
    cpp: `int alphaBeta(int node, int depth, int alpha, int beta, bool isMaximizing) {
    if (depth == 0) {
        return rand() % 10 - 5;
    }
    if (isMaximizing) {
        int maxEval = INT_MIN;
        for (int i = 0; i < 2; i++) {
            int eval = alphaBeta(node * 2 + i, depth - 1, alpha, beta, false);
            maxEval = max(maxEval, eval);
            alpha = max(alpha, eval);
            if (beta <= alpha) break;
        }
        return maxEval;
    } else {
        int minEval = INT_MAX;
        for (int i = 0; i < 2; i++) {
            int eval = alphaBeta(node * 2 + i, depth - 1, alpha, beta, true);
            minEval = min(minEval, eval);
            beta = min(beta, eval);
            if (beta <= alpha) break;
        }
        return minEval;
    }
}`,
    java: `public static int alphaBeta(int node, int depth, int alpha, int beta, boolean isMaximizing) {
    if (depth == 0) {
        return (int) (Math.random() * 10) - 5;
    }
    if (isMaximizing) {
        int maxEval = Integer.MIN_VALUE;
        for (int i = 0; i < 2; i++) {
            int eval = alphaBeta(node * 2 + i, depth - 1, alpha, beta, false);
            maxEval = Math.max(maxEval, eval);
            alpha = Math.max(alpha, eval);
            if (beta <= alpha) break;
        }
        return maxEval;
    } else {
        int minEval = Integer.MAX_VALUE;
        for (int i = 0; i < 2; i++) {
            int eval = alphaBeta(node * 2 + i, depth - 1, alpha, beta, true);
            minEval = Math.min(minEval, eval);
            beta = Math.min(beta, eval);
            if (beta <= alpha) break;
        }
        return minEval;
    }
}`,
  },
  mcts: {
    javascript: `function mcts(iterations) {
  let wins = 0;
  let total = 0;
  for (let i = 0; i < iterations; i++) {
    const result = Math.random() > 0.5 ? 1 : 0;
    wins += result;
    total++;
  }
  return wins / total;
}`,
    typescript: `function mcts(iterations: number): number {
  let wins = 0;
  let total = 0;
  for (let i = 0; i < iterations; i++) {
    const result = Math.random() > 0.5 ? 1 : 0;
    wins += result;
    total++;
  }
  return wins / total;
}`,
    python: `import random

def mcts(iterations):
    wins = 0
    total = 0
    for _ in range(iterations):
        result = 1 if random.random() > 0.5 else 0
        wins += result
        total += 1
    return wins / total`,
    cpp: `double mcts(int iterations) {
    int wins = 0;
    int total = 0;
    for (int i = 0; i < iterations; i++) {
        int result = (rand() % 2) ? 1 : 0;
        wins += result;
        total++;
    }
    return static_cast<double>(wins) / total;
}`,
    java: `public static double mcts(int iterations) {
    int wins = 0;
    int total = 0;
    Random rand = new Random();
    for (int i = 0; i < iterations; i++) {
        int result = rand.nextBoolean() ? 1 : 0;
        wins += result;
        total++;
    }
    return (double) wins / total;
}`,
  },
};

export const osCodes: Record<string, AlgorithmCode> = {
  fcfs: {
    javascript: `function fcfs(processes) {
  processes.sort((a, b) => a.arrivalTime - b.arrivalTime);
  let currentTime = 0;
  for (const p of processes) {
    if (currentTime < p.arrivalTime) {
      currentTime = p.arrivalTime;
    }
    console.log(\`P\${p.id} starts at t=\${currentTime}\`);
    currentTime += p.burstTime;
    console.log(\`P\${p.id} finishes at t=\${currentTime}\`);
  }
}`,
    typescript: `function fcfs(processes: Process[]) {
  processes.sort((a, b) => a.arrivalTime - b.arrivalTime);
  let currentTime = 0;
  for (const p of processes) {
    if (currentTime < p.arrivalTime) {
      currentTime = p.arrivalTime;
    }
    console.log(\`P\${p.id} starts at t=\${currentTime}\`);
    currentTime += p.burstTime;
    console.log(\`P\${p.id} finishes at t=\${currentTime}\`);
  }
}`,
    python: `def fcfs(processes):
    processes.sort(key=lambda x: x['arrivalTime'])
    current_time = 0
    for p in processes:
        if current_time < p['arrivalTime']:
            current_time = p['arrivalTime']
        print(f"P{p['id']} starts at t={current_time}")
        current_time += p['burstTime']
        print(f"P{p['id']} finishes at t={current_time}")`,
    cpp: `void fcfs(vector<Process>& processes) {
    sort(processes.begin(), processes.end(), [](const Process& a, const Process& b) {
        return a.arrivalTime < b.arrivalTime;
    });
    int currentTime = 0;
    for (const auto& p : processes) {
        if (currentTime < p.arrivalTime) {
            currentTime = p.arrivalTime;
        }
        cout << "P" << p.id << " starts at t=" << currentTime << endl;
        currentTime += p.burstTime;
        cout << "P" << p.id << " finishes at t=" << currentTime << endl;
    }
}`,
    java: `public static void fcfs(List<Process> processes) {
    processes.sort(Comparator.comparingInt(p -> p.arrivalTime));
    int currentTime = 0;
    for (Process p : processes) {
        if (currentTime < p.arrivalTime) {
            currentTime = p.arrivalTime;
        }
        System.out.println("P" + p.id + " starts at t=" + currentTime);
        currentTime += p.burstTime;
        System.out.println("P" + p.id + " finishes at t=" + currentTime);
    }
}`,
  },
  sjf: {
    javascript: `function sjf(processes) {
  processes.sort((a, b) => a.burstTime - b.burstTime);
  let currentTime = 0;
  for (const p of processes) {
    if (currentTime < p.arrivalTime) {
      currentTime = p.arrivalTime;
    }
    console.log(\`P\${p.id} starts at t=\${currentTime}\`);
    currentTime += p.burstTime;
    console.log(\`P\${p.id} finishes at t=\${currentTime}\`);
  }
}`,
    typescript: `function sjf(processes: Process[]) {
  processes.sort((a, b) => a.burstTime - b.burstTime);
  let currentTime = 0;
  for (const p of processes) {
    if (currentTime < p.arrivalTime) {
      currentTime = p.arrivalTime;
    }
    console.log(\`P\${p.id} starts at t=\${currentTime}\`);
    currentTime += p.burstTime;
    console.log(\`P\${p.id} finishes at t=\${currentTime}\`);
  }
}`,
    python: `def sjf(processes):
    processes.sort(key=lambda x: x['burstTime'])
    current_time = 0
    for p in processes:
        if current_time < p['arrivalTime']:
            current_time = p['arrivalTime']
        print(f"P{p['id']} starts at t={current_time}")
        current_time += p['burstTime']
        print(f"P{p['id']} finishes at t={current_time}")`,
    cpp: `void sjf(vector<Process>& processes) {
    sort(processes.begin(), processes.end(), [](const Process& a, const Process& b) {
        return a.burstTime < b.burstTime;
    });
    int currentTime = 0;
    for (const auto& p : processes) {
        if (currentTime < p.arrivalTime) {
            currentTime = p.arrivalTime;
        }
        cout << "P" << p.id << " starts at t=" << currentTime << endl;
        currentTime += p.burstTime;
        cout << "P" << p.id << " finishes at t=" << currentTime << endl;
    }
}`,
    java: `public static void sjf(List<Process> processes) {
    processes.sort(Comparator.comparingInt(p -> p.burstTime));
    int currentTime = 0;
    for (Process p : processes) {
        if (currentTime < p.arrivalTime) {
            currentTime = p.arrivalTime;
        }
        System.out.println("P" + p.id + " starts at t=" + currentTime);
        currentTime += p.burstTime;
        System.out.println("P" + p.id + " finishes at t=" + currentTime);
    }
}`,
  },
  rr: {
    javascript: `function rr(processes, quantum) {
  const queue = [...processes];
  let currentTime = 0;
  while (queue.length > 0) {
    const p = queue.shift();
    if (p.remaining > quantum) {
      p.remaining -= quantum;
      currentTime += quantum;
      console.log(\`P\${p.id} executes for \${quantum}, remaining=\${p.remaining}\`);
      queue.push(p);
    } else {
      currentTime += p.remaining;
      console.log(\`P\${p.id} finishes at t=\${currentTime}\`);
    }
  }
}`,
    typescript: `function rr(processes: Process[], quantum: number) {
  const queue = [...processes];
  let currentTime = 0;
  while (queue.length > 0) {
    const p = queue.shift()!;
    if (p.remaining > quantum) {
      p.remaining -= quantum;
      currentTime += quantum;
      console.log(\`P\${p.id} executes for \${quantum}, remaining=\${p.remaining}\`);
      queue.push(p);
    } else {
      currentTime += p.remaining;
      console.log(\`P\${p.id} finishes at t=\${currentTime}\`);
    }
  }
}`,
    python: `def rr(processes, quantum):
    queue = processes[:]
    current_time = 0
    while queue:
        p = queue.pop(0)
        if p['remaining'] > quantum:
            p['remaining'] -= quantum
            current_time += quantum
            print(f"P{p['id']} executes for {quantum}, remaining={p['remaining']}")
            queue.append(p)
        else:
            current_time += p['remaining']
            print(f"P{p['id']} finishes at t={current_time}")`,
    cpp: `void rr(vector<Process>& processes, int quantum) {
    queue<Process> q;
    for (const auto& p : processes) q.push(p);
    int currentTime = 0;
    while (!q.empty()) {
        Process p = q.front(); q.pop();
        if (p.remaining > quantum) {
            p.remaining -= quantum;
            currentTime += quantum;
            cout << "P" << p.id << " executes for " << quantum << ", remaining=" << p.remaining << endl;
            q.push(p);
        } else {
            currentTime += p.remaining;
            cout << "P" << p.id << " finishes at t=" << currentTime << endl;
        }
    }
}`,
    java: `public static void rr(List<Process> processes, int quantum) {
    Queue<Process> q = new LinkedList<>(processes);
    int currentTime = 0;
    while (!q.isEmpty()) {
        Process p = q.poll();
        if (p.remaining > quantum) {
            p.remaining -= quantum;
            currentTime += quantum;
            System.out.println("P" + p.id + " executes for " + quantum + ", remaining=" + p.remaining);
            q.add(p);
        } else {
            currentTime += p.remaining;
            System.out.println("P" + p.id + " finishes at t=" + currentTime);
        }
    }
}`,
  },
};

export const databaseCodes: Record<string, AlgorithmCode> = {
  bplus: {
    javascript: `function bplusInsert(root, value) {
  root.keys.push(value);
  root.keys.sort((a, b) => a - b);
  return root;
}`,
    typescript: `function bplusInsert(root: BPlusTreeNode, value: number): BPlusTreeNode {
  root.keys.push(value);
  root.keys.sort((a, b) => a - b);
  return root;
}`,
    python: `def bplus_insert(root, value):
    root['keys'].append(value)
    root['keys'].sort()
    return root`,
    cpp: `BPlusTreeNode* bplusInsert(BPlusTreeNode* root, int value) {
    root->keys.push_back(value);
    sort(root->keys.begin(), root->keys.end());
    return root;
}`,
    java: `public static BPlusTreeNode bplusInsert(BPlusTreeNode root, int value) {
    root.keys.add(value);
    Collections.sort(root.keys);
    return root;
}`,
  },
  queryOptimization: {
    javascript: `function queryOptimization(tables) {
  const plans = [];
  for (let i = 0; i < tables; i++) {
    const cost = Math.floor(Math.random() * 1000) + 100;
    plans.push({ plan: i + 1, cost });
  }
  return plans.reduce((best, current) => current.cost < best.cost ? current : best);
}`,
    typescript: `function queryOptimization(tables: number): { plan: number; cost: number } {
  const plans = [];
  for (let i = 0; i < tables; i++) {
    const cost = Math.floor(Math.random() * 1000) + 100;
    plans.push({ plan: i + 1, cost });
  }
  return plans.reduce((best, current) => current.cost < best.cost ? current : best);
}`,
    python: `def query_optimization(tables):
    plans = []
    for i in range(tables):
        cost = random.randint(100, 1100)
        plans.append({'plan': i + 1, 'cost': cost})
    return min(plans, key=lambda x: x['cost'])`,
    cpp: `struct QueryPlan { int plan; int cost; };

QueryPlan queryOptimization(int tables) {
    vector<QueryPlan> plans;
    for (int i = 0; i < tables; i++) {
        plans.push_back({i + 1, rand() % 1000 + 100});
    }
    return *min_element(plans.begin(), plans.end(), [](const QueryPlan& a, const QueryPlan& b) {
        return a.cost < b.cost;
    });
}`,
    java: `public static Map<String, Integer> queryOptimization(int tables) {
    List<Map<String, Integer>> plans = new ArrayList<>();
    Random rand = new Random();
    for (int i = 0; i < tables; i++) {
        Map<String, Integer> plan = new HashMap<>();
        plan.put("plan", i + 1);
        plan.put("cost", rand.nextInt(1000) + 100);
        plans.add(plan);
    }
    return plans.stream().min(Comparator.comparingInt(p -> p.get("cost"))).orElse(null);
}`,
  },
  transaction: {
    javascript: `function transaction(locks) {
  for (let i = 0; i < locks.length; i++) {
    console.log(\`T\${i + 1} acquires \${locks[i]} lock\`);
  }
  for (let i = 0; i < locks.length; i++) {
    console.log(\`T\${i + 1} commits\`);
  }
}`,
    typescript: `function transaction(locks: string[]) {
  for (let i = 0; i < locks.length; i++) {
    console.log(\`T\${i + 1} acquires \${locks[i]} lock\`);
  }
  for (let i = 0; i < locks.length; i++) {
    console.log(\`T\${i + 1} commits\`);
  }
}`,
    python: `def transaction(locks):
    for i, lock in enumerate(locks):
        print(f"T{i + 1} acquires {lock} lock")
    for i in range(len(locks)):
        print(f"T{i + 1} commits")`,
    cpp: `void transaction(const vector<string>& locks) {
    for (size_t i = 0; i < locks.size(); i++) {
        cout << "T" << (i + 1) << " acquires " << locks[i] << " lock" << endl;
    }
    for (size_t i = 0; i < locks.size(); i++) {
        cout << "T" << (i + 1) << " commits" << endl;
    }
}`,
    java: `public static void transaction(List<String> locks) {
    for (int i = 0; i < locks.size(); i++) {
        System.out.println("T" + (i + 1) + " acquires " + locks.get(i) + " lock");
    }
    for (int i = 0; i < locks.size(); i++) {
        System.out.println("T" + (i + 1) + " commits");
    }
}`,
  },
};

export const dpCodes: Record<string, AlgorithmCode> = {
  fibonacci: {
    javascript: `function fibonacci(n) {
  const dp = new Array(n + 1).fill(0);
  dp[0] = 0;
  dp[1] = 1;
  for (let i = 2; i <= n; i++) {
    dp[i] = dp[i - 1] + dp[i - 2];
  }
  return dp[n];
}`,
    typescript: `function fibonacci(n: number): number {
  const dp = new Array(n + 1).fill(0);
  dp[0] = 0; dp[1] = 1;
  for (let i = 2; i <= n; i++) dp[i] = dp[i - 1] + dp[i - 2];
  return dp[n];
}`,
    python: `def fibonacci(n):
    dp = [0] * (n + 1)
    dp[0], dp[1] = 0, 1
    for i in range(2, n + 1):
        dp[i] = dp[i-1] + dp[i-2]
    return dp[n]`,
    cpp: `int fibonacci(int n) {
    vector<int> dp(n + 1);
    dp[0] = 0; dp[1] = 1;
    for (int i = 2; i <= n; i++) dp[i] = dp[i-1] + dp[i-2];
    return dp[n];
}`,
    java: `public static int fibonacci(int n) {
    int[] dp = new int[n + 1];
    dp[0] = 0; dp[1] = 1;
    for (int i = 2; i <= n; i++) dp[i] = dp[i-1] + dp[i-2];
    return dp[n];
}`,
  },
  knapsack: {
    javascript: `function knapsack(weights, values, W) {
  const n = weights.length;
  const dp = Array(n + 1).fill(null).map(() => Array(W + 1).fill(0));
  for (let i = 1; i <= n; i++) {
    for (let w = 0; w <= W; w++) {
      if (weights[i-1] <= w) {
        dp[i][w] = Math.max(dp[i-1][w], dp[i-1][w-weights[i-1]] + values[i-1]);
      } else {
        dp[i][w] = dp[i-1][w];
      }
    }
  }
  return dp[n][W];
}`,
    typescript: `function knapsack(weights: number[], values: number[], W: number): number {
  const n = weights.length;
  const dp = Array(n + 1).fill(null).map(() => Array(W + 1).fill(0));
  for (let i = 1; i <= n; i++) {
    for (let w = 0; w <= W; w++) {
      if (weights[i-1] <= w) dp[i][w] = Math.max(dp[i-1][w], dp[i-1][w-weights[i-1]] + values[i-1]);
      else dp[i][w] = dp[i-1][w];
    }
  }
  return dp[n][W];
}`,
    python: `def knapsack(weights, values, W):
    n = len(weights)
    dp = [[0] * (W + 1) for _ in range(n + 1)]
    for i in range(1, n + 1):
        for w in range(W + 1):
            if weights[i-1] <= w:
                dp[i][w] = max(dp[i-1][w], dp[i-1][w-weights[i-1]] + values[i-1])
            else:
                dp[i][w] = dp[i-1][w]
    return dp[n][W]`,
    cpp: `int knapsack(vector<int>& w, vector<int>& v, int W) {
    int n = w.size();
    vector<vector<int>> dp(n + 1, vector<int>(W + 1, 0));
    for (int i = 1; i <= n; i++)
        for (int j = 0; j <= W; j++)
            if (w[i-1] <= j) dp[i][j] = max(dp[i-1][j], dp[i-1][j-w[i-1]] + v[i-1]);
            else dp[i][j] = dp[i-1][j];
    return dp[n][W];
}`,
    java: `public static int knapsack(int[] w, int[] v, int W) {
    int n = w.length;
    int[][] dp = new int[n + 1][W + 1];
    for (int i = 1; i <= n; i++)
        for (int j = 0; j <= W; j++)
            if (w[i-1] <= j) dp[i][j] = Math.max(dp[i-1][j], dp[i-1][j-w[i-1]] + v[i-1]);
            else dp[i][j] = dp[i-1][j];
    return dp[n][W];
}`,
  },
};

export const pathfindingCodes: Record<string, AlgorithmCode> = {
  astar: {
    javascript: `function aStar(grid, start, end) {
  const openSet = [start];
  const closedSet = new Set();
  const gScore = {};
  const fScore = {};
  gScore[start] = 0;
  fScore[start] = heuristic(start, end);

  while (openSet.length > 0) {
    const current = openSet.reduce((a, b) => fScore[a] < fScore[b] ? a : b);
    if (current === end) return reconstructPath(cameFrom, current);
    openSet.splice(openSet.indexOf(current), 1);
    closedSet.add(current);
    for (const neighbor of getNeighbors(grid, current)) {
      if (closedSet.has(neighbor)) continue;
      const tentativeG = gScore[current] + 1;
      if (!openSet.includes(neighbor)) openSet.push(neighbor);
      else if (tentativeG >= gScore[neighbor]) continue;
      cameFrom[neighbor] = current;
      gScore[neighbor] = tentativeG;
      fScore[neighbor] = tentativeG + heuristic(neighbor, end);
    }
  }
  return null;
}
function heuristic(a, b) { return Math.abs(a[0] - b[0]) + Math.abs(a[1] - b[1]); }`,
    typescript: `interface Node { row: number; col: number; }
function aStar(grid: number[][], start: Node, end: Node): Node[] | null {
  const openSet: Node[] = [start];
  const closedSet = new Set<string>();
  const key = (n: Node) => \`\${n.row},\${n.col}\`;
  const gScore = new Map<string, number>();
  const fScore = new Map<string, number>();
  gScore.set(key(start), 0);
  fScore.set(key(start), heuristic(start, end));
  while (openSet.length > 0) {
    const current = openSet.reduce((a, b) => (fScore.get(key(a)) || Infinity) < (fScore.get(key(b)) || Infinity) ? a : b);
    if (current.row === end.row && current.col === end.col) return reconstructPath(cameFrom, current);
    openSet.splice(openSet.indexOf(current), 1);
    closedSet.add(key(current));
    for (const neighbor of getNeighbors(grid, current)) {
      if (closedSet.has(key(neighbor))) continue;
      const tentativeG = (gScore.get(key(current)) || 0) + 1;
      if (!openSet.some(n => n.row === neighbor.row && n.col === neighbor.col)) openSet.push(neighbor);
      else if (tentativeG >= (gScore.get(key(neighbor)) || Infinity)) continue;
      cameFrom.set(key(neighbor), current);
      gScore.set(key(neighbor), tentativeG);
      fScore.set(key(neighbor), tentativeG + heuristic(neighbor, end));
    }
  }
  return null;
}
function heuristic(a: Node, b: Node): number { return Math.abs(a.row - b.row) + Math.abs(a.col - b.col); }`,
    python: `import heapq
def a_star(grid, start, end):
    open_set = [(0, start)]
    came_from = {}
    g_score = {start: 0}
    while open_set:
        _, current = heapq.heappop(open_set)
        if current == end: return reconstruct_path(came_from, current)
        for neighbor in get_neighbors(grid, current):
            tentative_g = g_score[current] + 1
            if neighbor not in g_score or tentative_g < g_score[neighbor]:
                came_from[neighbor] = current
                g_score[neighbor] = tentative_g
                heapq.heappush(open_set, (tentative_g + heuristic(neighbor, end), neighbor))
    return None`,
    cpp: `struct Node { int row, col; };
int heuristic(Node a, Node b) { return abs(a.row - b.row) + abs(a.col - b.col); }
vector<Node> aStar(vector<vector<int>>& grid, Node start, Node end) {
    priority_queue<pair<int, Node>, vector<pair<int, Node>>, greater<pair<int, Node>>> pq;
    pq.push({heuristic(start, end), start});
    unordered_map<string, Node> cameFrom;
    unordered_map<string, int> gScore;
    gScore[key(start)] = 0;
    while (!pq.empty()) {
        Node current = pq.top().second; pq.pop();
        if (current.row == end.row && current.col == end.col) return reconstructPath(cameFrom, current);
        for (Node neighbor : getNeighbors(grid, current)) {
            int tentativeG = gScore[key(current)] + 1;
            if (!gScore.count(key(neighbor)) || tentativeG < gScore[key(neighbor)]) {
                cameFrom[key(neighbor)] = current;
                gScore[key(neighbor)] = tentativeG;
                pq.push({tentativeG + heuristic(neighbor, end), neighbor});
            }
        }
    }
    return {};
}`,
    java: `public static List<int[]> aStar(int[][] grid, int[] start, int[] end) {
    PriorityQueue<int[]> pq = new PriorityQueue<>((a, b) -> {
        int fA = heuristic(a, end) + gScore.getOrDefault(key(a), Integer.MAX_VALUE);
        int fB = heuristic(b, end) + gScore.getOrDefault(key(b), Integer.MAX_VALUE);
        return Integer.compare(fA, fB);
    });
    pq.add(start);
    Map<String, int[]> cameFrom = new HashMap<>();
    gScore.put(key(start), 0);
    while (!pq.isEmpty()) {
        int[] current = pq.poll();
        if (current[0] == end[0] && current[1] == end[1]) return reconstructPath(cameFrom, current);
        for (int[] neighbor : getNeighbors(grid, current)) {
            int tentativeG = gScore.getOrDefault(key(current), Integer.MAX_VALUE) + 1;
            if (!gScore.containsKey(key(neighbor)) || tentativeG < gScore.get(key(neighbor))) {
                cameFrom.put(key(neighbor), current);
                gScore.put(key(neighbor), tentativeG);
                pq.add(neighbor);
            }
        }
    }
    return null;
}`,
  },
};

export const backtrackingCodes: Record<string, AlgorithmCode> = {
  nqueens: {
    javascript: `function solveNQueens(n) {
  const board = Array(n).fill(null).map(() => Array(n).fill('.'));
  const solutions = [];
  function isValid(board, row, col) {
    for (let i = 0; i < col; i++) if (board[row][i] === 'Q') return false;
    for (let i = row, j = col; i >= 0 && j >= 0; i--, j--) if (board[i][j] === 'Q') return false;
    for (let i = row, j = col; i < n && j >= 0; i++, j--) if (board[i][j] === 'Q') return false;
    return true;
  }
  function solve(col) {
    if (col >= n) { solutions.push(board.map(r => r.join(''))); return; }
    for (let i = 0; i < n; i++) {
      if (isValid(board, i, col)) { board[i][col] = 'Q'; solve(col + 1); board[i][col] = '.'; }
    }
  }
  solve(0);
  return solutions;
}`,
    typescript: `function solveNQueens(n: number): string[][] {
  const board = Array(n).fill(null).map(() => Array(n).fill('.'));
  const solutions: string[][] = [];
  function isValid(board: string[][], row: number, col: number): boolean {
    for (let i = 0; i < col; i++) if (board[row][i] === 'Q') return false;
    for (let i = row, j = col; i >= 0 && j >= 0; i--, j--) if (board[i][j] === 'Q') return false;
    for (let i = row, j = col; i < n && j >= 0; i++, j--) if (board[i][j] === 'Q') return false;
    return true;
  }
  function solve(col: number): void {
    if (col >= n) { solutions.push(board.map(r => r.join(''))); return; }
    for (let i = 0; i < n; i++) {
      if (isValid(board, i, col)) { board[i][col] = 'Q'; solve(col + 1); board[i][col] = '.'; }
    }
  }
  solve(0);
  return solutions;
}`,
    python: `def solve_n_queens(n):
    board = [['.' for _ in range(n)] for _ in range(n)]
    solutions = []
    def is_valid(row, col):
        for i in range(col):
            if board[row][i] == 'Q': return False
        for i, j in zip(range(row, -1, -1), range(col, -1, -1)):
            if board[i][j] == 'Q': return False
        for i, j in zip(range(row, n), range(col, -1, -1)):
            if board[i][j] == 'Q': return False
        return True
    def solve(col):
        if col >= n: solutions.append([''.join(row) for row in board]); return
        for i in range(n):
            if is_valid(i, col): board[i][col] = 'Q'; solve(col + 1); board[i][col] = '.'
    solve(0)
    return solutions`,
    cpp: `class NQueens {
public:
    vector<vector<string>> solveNQueens(int n) {
        vector<vector<string>> solutions;
        vector<string> board(n, string(n, '.'));
        solve(solutions, board, 0, n);
        return solutions;
    }
private:
    bool isValid(vector<string>& board, int row, int col, int n) {
        for (int i = 0; i < col; i++) if (board[row][i] == 'Q') return false;
        for (int i = row, j = col; i >= 0 && j >= 0; i--, j--) if (board[i][j] == 'Q') return false;
        for (int i = row, j = col; i < n && j >= 0; i++, j--) if (board[i][j] == 'Q') return false;
        return true;
    }
    void solve(vector<vector<string>>& solutions, vector<string>& board, int col, int n) {
        if (col >= n) { solutions.push_back(board); return; }
        for (int i = 0; i < n; i++) {
            if (isValid(board, i, col, n)) { board[i][col] = 'Q'; solve(solutions, board, col + 1, n); board[i][col] = '.'; }
        }
    }
};`,
    java: `class NQueens {
    public List<List<String>> solveNQueens(int n) {
        List<List<String>> solutions = new ArrayList<>();
        char[][] board = new char[n][n];
        for (char[] row : board) Arrays.fill(row, '.');
        solve(board, 0, n, solutions);
        return solutions;
    }
    private void solve(char[][] board, int col, int n, List<List<String>> solutions) {
        if (col >= n) { List<String> sol = new ArrayList<>(); for (char[] row : board) sol.add(new String(row)); solutions.add(sol); return; }
        for (int i = 0; i < n; i++) {
            if (isValid(board, i, col, n)) { board[i][col] = 'Q'; solve(board, col + 1, n, solutions); board[i][col] = '.'; }
        }
    }
    private boolean isValid(char[][] board, int row, int col, int n) {
        for (int i = 0; i < col; i++) if (board[row][i] == 'Q') return false;
        for (int i = row, j = col; i >= 0 && j >= 0; i--, j--) if (board[i][j] == 'Q') return false;
        for (int i = row, j = col; i < n && j >= 0; i++, j--) if (board[i][j] == 'Q') return false;
        return true;
    }
}`,
  },
};

export const greedyCodes: Record<string, AlgorithmCode> = {
  activity: {
    javascript: `function activitySelection(activities) {
  activities.sort((a, b) => a.end - b.end);
  const selected = [activities[0]];
  let lastEnd = activities[0].end;
  for (let i = 1; i < activities.length; i++) {
    if (activities[i].start >= lastEnd) { selected.push(activities[i]); lastEnd = activities[i].end; }
  }
  return selected;
}`,
    typescript: `interface Activity { start: number; end: number; }
function activitySelection(activities: Activity[]): Activity[] {
  activities.sort((a, b) => a.end - b.end);
  const selected = [activities[0]];
  let lastEnd = activities[0].end;
  for (let i = 1; i < activities.length; i++) {
    if (activities[i].start >= lastEnd) { selected.push(activities[i]); lastEnd = activities[i].end; }
  }
  return selected;
}`,
    python: `def activity_selection(activities):
    activities.sort(key=lambda x: x[1])
    selected = [activities[0]]
    last_end = activities[0][1]
    for start, end in activities[1:]:
        if start >= last_end: selected.append((start, end)); last_end = end
    return selected`,
    cpp: `vector<pair<int,int>> activitySelection(vector<pair<int,int>>& a) {
    sort(a.begin(), a.end(), [](auto& x, auto& y){ return x.second < y.second; });
    vector<pair<int,int>> selected = {a[0]};
    int lastEnd = a[0].second;
    for (auto& act : a) {
        if (act.first >= lastEnd) { selected.push_back(act); lastEnd = act.second; }
    }
    return selected;
}`,
    java: `public static List<int[]> activitySelection(int[][] activities) {
    Arrays.sort(activities, Comparator.comparingInt(a -> a[1]));
    List<int[]> selected = new ArrayList<>();
    selected.add(activities[0]);
    int lastEnd = activities[0][1];
    for (int[] act : activities) {
        if (act[0] >= lastEnd) { selected.add(act); lastEnd = act[1]; }
    }
    return selected;
}`,
  },
};

export const divideConquerCodes: Record<string, AlgorithmCode> = {
  mergeSort: {
    javascript: `function mergeSort(arr) {
  if (arr.length <= 1) return arr;
  const mid = Math.floor(arr.length / 2);
  const left = mergeSort(arr.slice(0, mid));
  const right = mergeSort(arr.slice(mid));
  return merge(left, right);
}
function merge(left, right) {
  const result = [];
  while (left.length && right.length) result.push(left[0] <= right[0] ? left.shift() : right.shift());
  return [...result, ...left, ...right];
}`,
    typescript: `function mergeSort(arr: number[]): number[] {
  if (arr.length <= 1) return arr;
  const mid = Math.floor(arr.length / 2);
  return merge(mergeSort(arr.slice(0, mid)), mergeSort(arr.slice(mid)));
}
function merge(left: number[], right: number[]): number[] {
  const result: number[] = [];
  while (left.length && right.length) result.push(left[0] <= right[0] ? left.shift()! : right.shift()!);
  return [...result, ...left, ...right];
}`,
    python: `def merge_sort(arr):
    if len(arr) <= 1: return arr
    mid = len(arr) // 2
    left = merge_sort(arr[:mid])
    right = merge_sort(arr[mid:])
    return merge(left, right)
def merge(left, right):
    result = []
    while left and right: result.append(left.pop(0) if left[0] <= right[0] else right.pop(0))
    return result + left + right`,
    cpp: `void merge(vector<int>& arr, int l, int m, int r) {
    vector<int> L(arr.begin()+l, arr.begin()+m+1), R(arr.begin()+m+1, arr.begin()+r+1);
    int i = 0, j = 0, k = l;
    while (i < L.size() && j < R.size()) arr[k++] = L[i] <= R[j] ? L[i++] : R[j++];
    while (i < L.size()) arr[k++] = L[i++];
    while (j < R.size()) arr[k++] = R[j++];
}
void mergeSort(vector<int>& arr, int l, int r) {
    if (l >= r) return;
    int m = l + (r - l) / 2;
    mergeSort(arr, l, m);
    mergeSort(arr, m + 1, r);
    merge(arr, l, m, r);
}`,
    java: `public static void mergeSort(int[] arr, int l, int r) {
    if (l >= r) return;
    int m = l + (r - l) / 2;
    mergeSort(arr, l, m);
    mergeSort(arr, m + 1, r);
    merge(arr, l, m, r);
}
private static void merge(int[] arr, int l, int m, int r) {
    int[] L = Arrays.copyOfRange(arr, l, m + 1);
    int[] R = Arrays.copyOfRange(arr, m + 1, r + 1);
    int i = 0, j = 0, k = l;
    while (i < L.length && j < R.length) arr[k++] = L[i] <= R[j] ? L[i++] : R[j++];
    while (i < L.length) arr[k++] = L[i++];
    while (j < R.length) arr[k++] = R[j++];
}`,
  },
};
