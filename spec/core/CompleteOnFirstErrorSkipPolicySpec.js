describe('CompleteOnFirstErrorSkipPolicy', function() {
  describe('#skipTo', function() {
    describe('Before anything has errored', function() {
      it('returns the next index', function() {
        const policy = new jasmineUnderTest.CompleteOnFirstErrorSkipPolicy(
          arrayOfArbitraryFns(4),
          4
        );
        expect(policy.skipTo(1)).toEqual(2);
      });
    });

    describe('After something has errored', function() {
      it('skips non cleanup fns', function() {
        const fns = arrayOfArbitraryFns(4);
        const policy = new jasmineUnderTest.CompleteOnFirstErrorSkipPolicy(
          fns,
          2
        );

        policy.fnErrored(0);
        expect(policy.skipTo(0)).toEqual(2);
        expect(policy.skipTo(2)).toEqual(3);
        expect(policy.skipTo(3)).toEqual(4);
      });

      describe('When the error was in a beforeEach fn', function() {
        it('runs cleanup fns defined by the current and containing suites', function() {
          const parentSuite = { description: 'parentSuite' };
          const suite = { description: 'suite', parentSuite };
          const fns = [
            {
              suite: suite
            },
            {
              fn: () => {}
            },
            {
              fn: () => {},
              suite: suite
            },
            {
              fn: () => {},
              suite: parentSuite
            }
          ];
          const policy = new jasmineUnderTest.CompleteOnFirstErrorSkipPolicy(
            fns,
            2
          );

          policy.fnErrored(0);
          expect(policy.skipTo(0)).toEqual(2);
          expect(policy.skipTo(2)).toEqual(3);
        });

        it('skips cleanup fns defined by nested suites', function() {
          const parentSuite = { description: 'parentSuite' };
          const suite = { description: 'suite', parentSuite };
          const fns = [
            {
              fn: () => {},
              type: 'beforeEach',
              suite: parentSuite
            },
            {
              fn: () => {}
            },
            {
              fn: () => {},
              suite: suite
            },
            {
              fn: () => {},
              suite: parentSuite
            }
          ];
          const policy = new jasmineUnderTest.CompleteOnFirstErrorSkipPolicy(
            fns,
            2
          );

          policy.fnErrored(0);
          expect(policy.skipTo(0)).toEqual(3);
        });
      });

      it('does not skip cleanup fns that have no suite, such as the spec complete fn', function() {
        const fns = [{ fn: () => {} }, { fn: () => {} }];
        const policy = new jasmineUnderTest.CompleteOnFirstErrorSkipPolicy(
          fns,
          1
        );

        policy.fnErrored(0);
        expect(policy.skipTo(0)).toEqual(1);
      });
    });
  });
});

function arrayOfArbitraryFns(n) {
  const result = [];

  for (let i = 0; i < n; i++) {
    result.push({ fn: () => {} });
  }

  return result;
}
