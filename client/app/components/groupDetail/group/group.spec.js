import GroupModule from "./group";

const { module } = angular.mock;

describe("Group", () => {
  let $httpBackend, $state, $log;
  beforeEach(module(GroupModule));
  beforeEach(module(($stateProvider) => {
    $stateProvider
      .state("main", { url: "", abstract: true });
  }));

  beforeEach(inject(($injector) => {
    $log = $injector.get("$log");
    $log.reset();
  }));
  afterEach(() => {
    $log.assertEmpty();
  });

  beforeEach(inject(($injector) => {
    $httpBackend = $injector.get("$httpBackend");
    $state = $injector.get("$state");
  }));

  afterEach(() => {
    $httpBackend.verifyNoOutstandingExpectation();
    $httpBackend.verifyNoOutstandingRequest();
  });

  describe("Module", () => {
    it("is named group", () => {
      expect(GroupModule).to.equal("group");
    });
  });

  describe("Controller", () => {
    let CurrentGroup, $componentController;

    beforeEach(inject(($injector) => {
      $componentController = $injector.get("$componentController");
      CurrentGroup = $injector.get("CurrentGroup");
      sinon.stub($state, "go");
    }));

    it("should exist", () => {
      let $ctrl = $componentController("groupComponent", {});
      expect($ctrl).to.exist;
    });


    it("should be able to leave a group", () => {
      let $ctrl = $componentController("groupComponent", {});
      let groupData = { id: 9834 };
      $httpBackend.expectPOST(`/api/groups/${groupData.id}/leave/`).respond(200);
      Object.assign($ctrl, { groupData });
      $ctrl.leaveGroup();
      $httpBackend.flush();
      expect($state.go).to.have.been.calledWith("home");
    });

    it("clears the current group if you leave it", () => {
      let $ctrl = $componentController("groupComponent", {});
      let groupData = { id: 2424 };
      $httpBackend.expectPOST(`/api/groups/${groupData.id}/leave/`).respond(200);
      CurrentGroup.set({ id: groupData.id });
      expect(CurrentGroup.value).to.deep.equal({ id: groupData.id });
      Object.assign($ctrl, { groupData });
      $ctrl.leaveGroup();
      $httpBackend.flush();
      expect(CurrentGroup.value).to.deep.equal({});
      expect($state.go).to.have.been.calledWith("home");
    });

    it("sets an error flag if leaving fails", () => {
      let $ctrl = $componentController("groupComponent", {});
      let groupData = { id: 98238 };
      $httpBackend.expectPOST(`/api/groups/${groupData.id}/leave/`).respond(400);
      Object.assign($ctrl, { groupData });
      $ctrl.leaveGroup();
      $httpBackend.flush();
      expect($ctrl.error.leaveGroup).to.be.true;
      expect($state.go).to.not.have.been.called;
    });

    it("saves groupData", () => {
      let groupData = { id: 667, name: "blarb" };
      let $ctrl = $componentController("groupComponent", {}, { groupData });
      let feedback = $ctrl.updateGroupData();
      $httpBackend.expectPATCH(`/api/groups/${groupData.id}/`, groupData).respond(groupData);
      $httpBackend.flush();
      expect(feedback).to.eventually.deep.equal(groupData);
    });
  });
});
