# TODO: Fix Disabled Run and Submit Buttons in ProblemWorkspace

## Steps to Complete
- [x] Lift code and language state from CodeEditor to ProblemWorkspace
- [x] Modify handleRun in ProblemWorkspace to use state code and language
- [x] Add handleSubmit in ProblemWorkspace similar to handleRun
- [x] Update CodeEditor to accept onSubmit prop and call it on shortcut
- [x] Update CodeEditor Run button to call onRun without args and remove internal isRunning
- [x] Pass isRunning from ProblemWorkspace to CodeEditor to disable Run button when running
- [x] Create /api/submit/route.js endpoint
- [x] Test the buttons functionality
