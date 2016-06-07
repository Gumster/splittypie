import { test } from "qunit";
import moduleForAcceptance from "splittypie/tests/helpers/module-for-acceptance";

moduleForAcceptance("Acceptance | transaction");

test("adding new transaction", function (assert) {
    runWithTestData("without-transactions", (events) => {
        const event = events[0];

        visit(`/${event.id}/transactions`);
        andThen(() => {
            assert.ok(
                exist("div:contains('There are no transactions yet')"),
                "No transactions text"
            );
            assert.ok(
                exist("div:contains('Add your first transaction')"),
                "Transaction onboarding"
            );
        });

        click("a.btn-add-transaction");
        // defaults
        andThen(() => {
            assert.equal(
                find(".transaction-participants input:checked").length,
                4,
                "Everyone selected by default"
            );
        });

        andThen(() => {
            const AliceId = find(".transaction-payer select option:contains('Alice')").val();

            fillIn(".transaction-payer", AliceId);
            fillIn(".transaction-name", "special bottle of vodka");
            fillIn(".transaction-amount", "50");
            click("button:contains('Create')");
        });

        reloadPage();
        // check for transaction
        andThen(() => {
            const expectedMessage = "Alice paid for special bottle of vodka";

            assert.ok(exist(".transaction-list-item:contains('50 EUR')"), "transaction amount");
            assert.ok(
                exist(`.transaction-list-item:contains('${expectedMessage}')`),
                "transaction item"
            );
            assert.notOk(
                exist("div:contains('Add your first transaction')"),
                "No Transaction onboarding text"
            );
        });
    });
});

test("editing/removing transaction", function (assert) {
    runWithTestData("default", (events) => {
        const event = events[0];

        visit(`/${event.id}/transactions`);
        andThen(() => {
            assert.ok(exist(".transaction-list-item:contains('1250 EUR')"), "transaction amount");
            assert.ok(
                exist(".transaction-list-item:contains('John paid for Plane tickets')"),
                "transaction item"
            );
            assert.ok(
                exist(".transaction-list-item:contains('Alice, John, Daria, Bob')"),
                "transaction item participants"
            );
        });

        click(".transaction-list-item");
        andThen(() => {
            const BobId = find(".transaction-payer select option:contains('Bob')").val();

            fillIn(".transaction-payer", BobId);
            fillIn(".transaction-name", "special");
            fillIn(".transaction-amount", "50");
            click("button:contains('Save')");
        });

        reloadPage();
        andThen(() => {
            assert.ok(exist(".transaction-list-item:contains('50 EUR')"), "transaction amount");
            assert.ok(
                exist(".transaction-list-item:contains('Bob paid for special')"),
                "transaction item"
            );
            assert.ok(
                exist(".transaction-list-item:contains('Alice, John, Daria, Bob')"),
                "transaction item participants"
            );
        });

        click(".transaction-list-item:contains('Bob paid for special')");
        click("button.delete-transaction");

        andThen(() => {
            assert.ok(exist("div:contains('Are you sure?')"), "delete confirmation");
        });
        click("button:contains('Yes')");
        andThen(() => {
            assert.notOk(
                exist(".transaction-list-item:contains('Bob paid for special')"),
                "deleted transaction item"
            );
        });
    });
});
