import { of } from 'rxjs';
import { NO_ACCESSIBLE_PHASES, SessionData } from '../../src/app/core/models/session.model';
import { PhaseService } from '../../src/app/core/services/phase.service';
import { Phase } from '../../src/app/core/models/phase.model';
import { MODERATION_PHASE_SESSION_DATA, MULTIPLE_OPEN_PHASES_SESSION_DATA, NO_OPEN_PHASES_SESSION_DATA } from '../constants/session.constants';

let phaseService: PhaseService;
let githubService: any;

describe('PhaseService', () => {
  beforeEach(() => {
    githubService = jasmine.createSpyObj('GithubService',
      ['fetchSettingsFile', 'storePhaseDetails']);
    phaseService = new PhaseService(null, githubService, null, null, null);
  });

  describe('.storeSessionData()', () => {
    it('should return an Observable of true if an openPhase is defined', () => {
      githubService.fetchSettingsFile.and.returnValue(of(MODERATION_PHASE_SESSION_DATA));
      phaseService.storeSessionData().subscribe((result: boolean) => {
        expect(result).toBeTrue();
      });
    });

    it('should return an Observable of true if multiple openPhases are defined', () => {
      githubService.fetchSettingsFile.and.returnValue(of(MULTIPLE_OPEN_PHASES_SESSION_DATA));
      phaseService.storeSessionData().subscribe((result: boolean) => {
        expect(result).toBeTrue();
      });
    });

    it('should throw an error if no openPhases are defined', () => {
      githubService.fetchSettingsFile.and.returnValue(of(NO_OPEN_PHASES_SESSION_DATA));
      phaseService.storeSessionData().subscribe({
        next: () => fail(),
        error: (err) => expect(err).toEqual(new Error(NO_ACCESSIBLE_PHASES))
      });
    });
  });

  describe('.githubRepoPermissionLevel()', () => {
    it('should return "repo" if phaseModeration is included in openPhases', () => {
      phaseService.sessionData = MODERATION_PHASE_SESSION_DATA;
      expect(phaseService.sessionData.openPhases).toContain(Phase.phaseModeration);
      expect(phaseService.githubRepoPermissionLevel()).toEqual('repo');
    });

    it('should return "public_repo" if phaseModeration is not included in openPhases', () => {
      phaseService.sessionData = NO_OPEN_PHASES_SESSION_DATA;
      expect(phaseService.sessionData.openPhases).not.toContain(Phase.phaseModeration);
      expect(phaseService.githubRepoPermissionLevel()).toEqual('public_repo');
    });
  });

  describe('.reset()', () => {
    it('should reset the currentPhase of the PhaseService', () => {
      phaseService.currentPhase = Phase.phaseBugReporting;
      phaseService.reset();
      expect(phaseService.currentPhase).toBeNull();
    });
  });
});
