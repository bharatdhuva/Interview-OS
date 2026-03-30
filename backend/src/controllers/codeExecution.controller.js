const { NodeVM } = require('vm2');

/**
 * POST /api/v1/rooms/:roomId/code/execute
 * Execute JavaScript code in a sandboxed environment (Node.js only, safe for demo)
 */
exports.executeCode = async (req, res) => {
  const { code, language } = req.body;
  if (!code || !language) {
    return res.status(400).json({ success: false, message: 'Missing code or language.' });
  }
  if (language !== 'javascript') {
    return res.status(400).json({ success: false, message: 'Only JavaScript execution is supported in this demo.' });
  }
  try {
    const vm = new NodeVM({
      console: 'redirect',
      timeout: 2000,
      sandbox: {},
      eval: false,
      wasm: false,
      require: false,
    });
    let stdout = '';
    let stderr = '';
    vm.on('console.log', (...args) => { stdout += args.join(' ') + '\n'; });
    vm.on('console.error', (...args) => { stderr += args.join(' ') + '\n'; });
    let result;
    try {
      result = vm.run(code, 'vm.js');
    } catch (err) {
      stderr += err.message + '\n';
    }
    return res.json({
      success: true,
      data: {
        stdout: stdout.trim(),
        stderr: stderr.trim(),
        time: '0.01',
        memory: 0,
      },
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Execution failed.' });
  }
};
